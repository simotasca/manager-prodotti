const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const fs = require("fs");

const LOADER_LEN = 100;

function printProgress(idx, tot) {
  const progress = Math.floor((idx * LOADER_LEN) / tot) || 1;
  const counter =
    "(" +
    (idx + 1).toString().padStart(tot.toString().length, " ") +
    "/" +
    tot +
    ")";
  const progBar =
    "[" + ("=".repeat(progress) + ">").padEnd(LOADER_LEN, " ") + "]";
  process.stdout.clearLine();
  process.stdout.write("\r" + counter + " " + progBar);
}

function clearProgress() {
  process.stdout.clearLine();
  process.stdout.write("\r");
}

function parseField(field) {
  let result = field.trim().replace("<br/>", "").replace("<br>", "");
  if (result == "null") return null;
  return result;
}

async function seedCategorie() {
  const categorieDemo = [
    "Olio",
    "Formaggi",
    "Carne",
    "Pesce",
    "Latte",
    "Frutta",
    "Verdura",
    "Bibite",
    "Snack",
  ];
  console.log("CREAZIONE CATEGORIE ...");
  let idx = 0;
  for (const categoria of categorieDemo) {
    printProgress(idx, categorieDemo.length);
    await prisma.categoriaProdotto.create({ data: { nome: categoria } });
    idx++;
  }
  clearProgress();
  console.log(categorieDemo.length + " CATEGORIE CREATE ⭐");
}

async function seedAziende() {
  const rawdata = fs.readFileSync(__dirname + "/../public/aziende.json");
  const aziende = JSON.parse(rawdata);
  let idx = 0;
  console.log("CREAZIONE AZIENDE ...");
  let c = [];
  for (const azienda of aziende) {
    printProgress(idx, aziende.length);
    const newAzienda = {
      nome: parseField(azienda["Denominazione"]),
      indirizzo: parseField(azienda["Azienda_indirizzo"]) || null,
      cap: parseInt(parseField(azienda["Azienda_CAP"])) || null,
      localita: parseField(azienda["Azienda_localita"]) || null,
      provincia: parseField(azienda["Azienda_provincia"]) || null,
    };
    if (azienda["Azienda_telefoni"])
      newAzienda.telefoni = parseField(azienda["Azienda_telefoni"]);
    if (azienda["Email"]) newAzienda.mail = parseField(azienda["Email"]);
    if (azienda["Azienda_contatti"])
      newAzienda.contatti = parseField(azienda["Azienda_contatti"]);
    await prisma.azienda.create({ data: newAzienda });
    idx++;
  }
  clearProgress();

  console.log(aziende.length + " AZIENDE CREATE ⭐");
}

async function main() {
  await prisma.gruppoProdotti.deleteMany();
  console.log("GRUPPI PRODOTTI ELIMINATI 🗑️");

  await prisma.prodottoCertificato.deleteMany();
  console.log("PRODOTTI CERTIFICATI ELIMINATI 🗑️");

  await prisma.prodotto.deleteMany();
  console.log("PRODOTTI ELIMINATI 🗑️");

  await prisma.certificato.deleteMany();
  console.log("CERTIFICATI ELIMINATI 🗑️");

  await prisma.azienda.deleteMany();
  console.log("AZIENDE ELIMINATE 🗑️");

  await seedAziende();
  await seedCategorie();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
