import { createHash } from "node:crypto";
import { copyFile, mkdir, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const sourceDirectory = process.argv[2];
if (!sourceDirectory) {
  throw new Error("Pass the attachment directory as the first argument.");
}

const workspace = process.cwd();
const originalsDirectory = path.join(
  workspace,
  "client-reference",
  "product-originals",
);
const publicProductsDirectory = path.join(workspace, "public", "assets", "products");

const outputs = [
  {
    source: "50-lph-commercial-ro-plant-500x500.jpeg",
    output: "commercial-ro/commercial-ro-plant-50-lph.webp",
    classification: "Commercial/industrial RO system; seller-source product image",
    alt: "Commercial RO plant with stainless-steel frame and blue filter housings",
  },
  {
    source: "ro-water-purifier-500x500.jpg.jpeg",
    output: "commercial-ro/commercial-ro-system-blue-housings.webp",
    classification: "Commercial/industrial RO system; seller-source product image",
    alt: "Compact commercial RO system with three blue filter housings",
  },
  {
    source: "images-p1-500x500.jpg.jpeg",
    output: "filter-assemblies/domestic-ro-filter-assembly.webp",
    classification: "RO filter assembly; highest-named duplicate selected",
    alt: "Domestic reverse-osmosis filter assembly with three filter housings",
  },
  {
    source: "product11530257032-500x500.png",
    output: "purifier-bodies/ro-water-purifier-body-aqua-crystal.webp",
    classification: "RO water purifier body; seller-listed Alpron catalogue item",
    alt: "White and translucent blue RO water purifier body with dispensing tap",
  },
  {
    source: "aquaguard-ro-water-purifier-250x250.jpg.jpeg",
    output: "domestic-purifiers/aquaguard-ro-water-purifier.webp",
    classification: "Third-party branded product; draft only",
    alt: "Aquaguard branded countertop water purifier in blue and white",
  },
  {
    source: "kent-ro-water-purifier-250x250.jpg.jpeg",
    output: "domestic-purifiers/kent-ro-water-purifier.webp",
    classification: "Third-party branded product; draft only",
    alt: "Kent branded wall-mounted RO water purifier",
  },
  {
    source: "pureit-water-purifiers-250x250.jpg.jpeg",
    output: "domestic-purifiers/pureit-water-purifier.webp",
    classification: "Third-party branded product; draft only",
    alt: "Pureit branded water purifier in white and blue",
  },
  {
    source: "multilife-500x500.jpg.jpeg",
    output: "domestic-purifiers/multilife-jasper-water-purifier.webp",
    classification: "Third-party branded product; draft only",
    alt: "Multi Life Jasper branded water purifier in pale blue",
  },
  {
    source: "product-jpeg-500x500.jpeg",
    output: "domestic-purifiers/brio-nexus-water-purifier.webp",
    classification: "Third-party branded promotional reference; draft only",
    alt: "Brio water purifier from the Nexus series shown in a promotional image",
  },
  {
    source: "product11530256958-500x500.png",
    output: "domestic-purifiers/nexus-candy-ro-purifier.webp",
    classification: "Third-party branded product; draft only",
    alt: "Nexus Candy branded domestic RO water purifier",
  },
  {
    source: "product11530256983-500x500.png",
    output: "domestic-purifiers/nexus-aquafresh-ro-purifier-box.webp",
    classification: "Third-party branded product packaging; draft gallery image",
    alt: "Nexus Aquafresh RO purifier retail box showing the purifier",
  },
  {
    source: "product11530256991-500x500.png",
    output: "domestic-purifiers/nexus-aquafresh-ro-purifier.webp",
    classification: "Third-party branded product; draft only",
    alt: "Nexus Aquafresh branded domestic RO water purifier",
  },
  {
    source: "product11530256998-500x500.png",
    output: "domestic-purifiers/nexus-purple-ro-purifier.webp",
    classification: "Third-party branded product; draft only",
    alt: "Nexus branded domestic RO purifier with purple front panel",
  },
  {
    source: "product11530257010-500x500.png",
    output: "domestic-purifiers/nexus-star-ro-purifier.webp",
    classification: "Third-party branded product; highest-resolution duplicate selected",
    alt: "Nexus Star branded domestic RO water purifier",
  },
  {
    source: "reverse-osmosis-water-purifiers-500x500.png",
    output: "domestic-purifiers/nexus-opel-chrome-ro-purifier.webp",
    classification: "Third-party branded product; draft only",
    alt: "Nexus Opel Chrome branded domestic RO water purifier",
  },
];

const excluded = [
  {
    source: "data2-lg-di-imfcp-4660043-fileuploads-15618-1561819715815a36401eda4849e4e4d4cc5b293f.jpg.jpeg",
    reason: "AASPL globe reference mark; not the official Alpron logo and not a product.",
  },
  {
    source: "data2-lg-di-imfcp-4660043-fileuploads-15618-1561819715815a36401eda4849e4e4d4cc5b293f-120x120.jpg.jpeg",
    reason: "Lower-resolution AASPL globe reference mark duplicate.",
  },
  {
    source: "images-p1-125x125.jpg.jpeg",
    reason: "Lower-resolution duplicate of the RO filter assembly.",
  },
  {
    source: "images-p1-250x250.jpg.jpeg",
    reason: "Byte-identical to the selected file despite its smaller filename label.",
  },
  {
    source: "product11530257010-250x250.png",
    reason: "Lower-resolution duplicate of the selected 500-labelled Nexus Star image.",
  },
];

await mkdir(originalsDirectory, { recursive: true });
for (const folder of [
  "commercial-ro",
  "domestic-purifiers",
  "filter-assemblies",
  "purifier-bodies",
]) {
  await mkdir(path.join(publicProductsDirectory, folder), { recursive: true });
}

const sourceNames = await readdir(sourceDirectory);
for (const sourceName of sourceNames) {
  await copyFile(
    path.join(sourceDirectory, sourceName),
    path.join(originalsDirectory, sourceName),
  );
}

const manifest = [];
for (const item of outputs) {
  const inputPath = path.join(sourceDirectory, item.source);
  const outputPath = path.join(publicProductsDirectory, item.output);
  const input = await sharp(inputPath).rotate().toBuffer();
  const inputMetadata = await sharp(input).metadata();
  const { data, info } = await sharp(input)
    .resize({
      width: 1400,
      height: 1400,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: 88, smartSubsample: true })
    .toBuffer({ resolveWithObject: true });

  await writeFile(outputPath, data);
  manifest.push({
    ...item,
    sourceWidth: inputMetadata.width,
    sourceHeight: inputMetadata.height,
    outputWidth: info.width,
    outputHeight: info.height,
    outputBytes: data.byteLength,
    sha256: createHash("sha256").update(data).digest("hex"),
    publicUrl: `/assets/products/${item.output.replaceAll("\\", "/")}`,
  });
}

await writeFile(
  path.join(workspace, "client-reference", "product-assets-manifest.json"),
  `${JSON.stringify(
    {
      checkedAt: "2026-07-21",
      sourceDirectory,
      outputs: manifest,
      excluded,
    },
    null,
    2,
  )}\n`,
  "utf8",
);

console.log(
  JSON.stringify({
    originalsPreserved: sourceNames.length,
    websiteAssetsCreated: manifest.length,
    duplicatesOrReferencesExcluded: excluded.length,
  }),
);
