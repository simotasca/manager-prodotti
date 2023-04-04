// Libreria utilizzata
// https://artskydj.github.io/jsPDF/docs/jsPDF.html

// Coveretitore da .ttf in file js (il file importa direttamente il font in jsPdf)
// https://peckconsulting.s3.amazonaws.com/fontconverter/fontconverter.html

import {} from "../../public/pdf/NotoSerif-normal";
import {} from "../../public/pdf/NotoSerif-italic";
import {} from "../../public/pdf/NotoSerif-bold";
import {} from "../../public/pdf/NotoSerif-bolditalic";
import {} from "../../public/pdf/FrankRuhlLibre-bold";

type Azienda = any;
type BrandCertificato = any;
type CategoriaProdotto = any;
type Certificato = any;
type GruppoProdotti = any;
type Prodotto = any;
type ProdottoCertificato = any;

import { jsPDF, jsPDFOptions } from "jspdf";
import { HDate } from "@hebcal/core";

type ProdottoCertificatoCompleto = ProdottoCertificato & {
  prodotto: Prodotto & {
    gruppo:
      | GruppoProdotti & {
          categoria: CategoriaProdotto;
        };
  };
};

type CertificatoCompleto = Certificato & {
  azienda: Azienda;
  prodottiCertificati: ProdottoCertificatoCompleto[];
  brandCertificati: BrandCertificato[];
};

interface StyledText {
  text: string;
  style?: "normal" | "bold" | "italic" | "bolditalic";
  font?: string;
  size?: number;
}

interface GruppoConNote {
  nome: string;
  note: string;
  prodotti: string[];
}

interface BoundingBox {
  x: number; // left
  y: number; // top
  w?: number; // width
  h?: number; // height
}

const UNIT = "px";
const DOC_SIZE = { WIDTH: 738, HEIGHT: 1044 };

const BOUNDING_BOX = {
  LEFT: 110,
  TOP: 240,
  WIDTH: 516,
  HEIGHT: 770,
};

const HEADER_SRC = "pdf/header.png";
const HEADER_SRC_PASSOVER = "pdf/header-passover.png";
const HEADER_EXT = "PNG";
const HEADER_SIZE = { WIDTH: 738, HEIGHT: 232 };

const FOOTER_SRC = "pdf/footer.png";
const FOOTER_EXT = "PNG";
const FOOTER_SIZE = { WIDTH: 738, HEIGHT: 188 };

const FONT_NAME = "NotoSerif";
const FONT_HEB = "FrankRuhlLibre";

const SMALL_SIZE = 10,
  SMALL_LINE_HEIGHT = 16,
  SMALL_STYLE = "normal",
  SMALL_COLOR = "#000000";

const TEXT_SIZE = 11,
  TEXT_LINE_HEIGHT = 18,
  TEXT_STYLE = "normal",
  TEXT_COLOR = "#000000";

const H1_SIZE = 18,
  H1_LINE_HEIGHT = 27,
  H1_STYLE = "bold",
  H1_COLOR = "#000000";

const H2_SIZE = 14,
  H2_LINE_HEIGHT = 21,
  H2_STYLE = "bolditalic",
  H2_COLOR = "#000000";

const HANDWRITE_SPACE = 10;

// variabili che saranno manipolate
let lineHeight = TEXT_LINE_HEIGHT;

function setH1(doc: jsPDF) {
  doc.setFont(FONT_NAME, H1_STYLE);
  doc.setFontSize(H1_SIZE);
  doc.setTextColor(H1_COLOR);
  lineHeight = H1_LINE_HEIGHT;
}

function setH2(doc: jsPDF) {
  doc.setFont(FONT_NAME, H2_STYLE);
  doc.setFontSize(H2_SIZE);
  doc.setTextColor(H2_COLOR);
  lineHeight = H2_LINE_HEIGHT;
}

function setBaseText(doc: jsPDF) {
  doc.setFont(FONT_NAME, TEXT_STYLE);
  doc.setFontSize(TEXT_SIZE);
  doc.setTextColor(TEXT_COLOR);
  lineHeight = TEXT_LINE_HEIGHT;
}

function setSmallText(doc: jsPDF) {
  doc.setFont(FONT_NAME, SMALL_STYLE);
  doc.setFontSize(SMALL_SIZE);
  doc.setTextColor(SMALL_COLOR);
  lineHeight = SMALL_LINE_HEIGHT;
}

function setItalic(doc: jsPDF) {
  doc.setFont(FONT_NAME, "italic");
}

function setBold(doc: jsPDF) {
  doc.setFont(FONT_NAME, "bold");
}

function setNormal(doc: jsPDF) {
  doc.setFont(FONT_NAME, "normal");
}

function monthToString(month: number) {
  switch (month) {
    case 0:
      return "January";
    case 1:
      return "February";
    case 2:
      return "March";
    case 3:
      return "April";
    case 4:
      return "May";
    case 5:
      return "June";
    case 6:
      return "July";
    case 7:
      return "August";
    case 8:
      return "September";
    case 9:
      return "October";
    case 10:
      return "November";
    case 11:
      return "December";
    default:
      return null;
  }
}

function toDateFormat(stringDate?: any) {
  const date = new Date(stringDate?.toString() || "");
  return stringDate
    ? monthToString(date.getMonth()) +
        " " +
        date.getDate() +
        ", " +
        date.getFullYear()
    : null;
}

function gregToHebDate(date: string | number | Date) {
  const hDate = new HDate(new Date(date));
  return `${hDate.getDate()} ${hDate.getMonthName()}, ${hDate.getFullYear()}`;
}

/**
 * Adds a text to the doc and returns his boundaries
 */
function addText(doc: jsPDF, text: string, bb: BoundingBox) {
  let lineY = bb.y;
  let maxOccupiedWidh = 0;
  if (bb.w)
    doc.splitTextToSize(text, bb.w).forEach((line: string) => {
      // LA POSIZIONE SI AGGIORNA OGNI VOLTA CHE SCRIVO
      // IL CHECK PER LA PAGINA AVVIENE DUNQUE PRIMA DI SCIRVERE
      // checkNewPage(doc);
      doc.text(line, bb.x, lineY);
      maxOccupiedWidh = Math.max(doc.getTextWidth(text), maxOccupiedWidh);
      lineY += lineHeight;
    });
  else {
    doc.text(text, bb.x, lineY);
    maxOccupiedWidh = doc.getTextWidth(text);
    lineY += lineHeight;
  }
  return { x: bb.x + maxOccupiedWidh, y: lineY };
}

function addCenteredText(
  doc: jsPDF,
  text: string,
  bb: Required<Omit<BoundingBox, "h">>
) {
  let lineY = bb.y;
  let maxOccupiedWidh = 0;
  doc.splitTextToSize(text, bb.w).forEach((line: string) => {
    // LA POSIZIONE SI AGGIORNA OGNI VOLTA CHE SCRIVO
    // IL CHECK PER LA PAGINA AVVIENE DUNQUE PRIMA DI SCIRVERE
    // checkNewPage(doc);
    let x = bb.x + (bb.w - doc.getTextWidth(line)) / 2;
    doc.text(line, x, lineY);
    maxOccupiedWidh = Math.max(doc.getTextWidth(text), maxOccupiedWidh);
    lineY += lineHeight;
  });
  return { x: bb.x + maxOccupiedWidh, y: lineY };
}

function splitTextFromStartedLine(
  doc: jsPDF,
  text: string,
  relativeX: number,
  width: number
): string[] {
  let firstSplit = doc.splitTextToSize(text, width - relativeX);
  let firstLine = firstSplit[0];
  let result = [firstLine];
  if (firstSplit.length > 1) {
    result.push(...doc.splitTextToSize(text.replace(firstLine, ""), width));
  }
  return result;
}

function addInlineTextsWithStyle(
  doc: jsPDF,
  styledTexts: StyledText[],
  bb: Required<Omit<BoundingBox, "h">>
) {
  let lastX = bb.x,
    lastY = bb.y;
  styledTexts.forEach((styled) => {
    doc.setFont(styled.font || FONT_NAME, styled.style);
    styled.size && doc.setFontSize(styled.size);
    let lines = splitTextFromStartedLine(doc, styled.text, lastX - bb.x, bb.w);
    lines.forEach((line, idx) => {
      let text = line;
      if (idx > 0) {
        lastX = bb.x;
        text = text.trimStart();
      }
      // let w = idx == 0 ? bb.w + bb.x - lastX : bb.w;
      let bound = addText(doc, text, { x: lastX, y: lastY });
      lastX = bound.x;
      lastY = bound.y;
    });
    lastX = lastX;
    lastY -= lineHeight;
  });
  lastY += lineHeight;
  return { x: lastX, y: lastY };
}

function calculateColumns(
  doc: jsPDF,
  texts: string[],
  width: number,
  colSpacer = 35,
  maxColumns?: number
) {
  const textSizes = texts.map((text) => ({
    text: text,
    ...doc.getTextDimensions(text),
  }));
  const minNumCol: number = textSizes.reduce((prev, textSize) => {
    let numCols = Math.max(
      1,
      Math.floor((width + colSpacer) / (textSize.w + colSpacer))
    );
    return Math.min(prev, numCols);
  }, maxColumns || 999);
  return minNumCol;
}

function calcColWidth(w: number, nCols: number, colSpacer: number) {
  return (w + colSpacer) / nCols;
}

function addTextColumns(
  doc: jsPDF,
  texts: string[],
  numCols: number,
  bb: Required<Omit<BoundingBox, "h">>,
  colSpacer = 35,
  rowSpacer = 2
) {
  let lineY = bb.y;
  const columnWidth = calcColWidth(bb.w, numCols, colSpacer);
  let currColumn = 0;
  let maxRowY = 0;
  texts.forEach((text) => {
    if (currColumn >= numCols) {
      currColumn = 0;
      lineY = maxRowY;
    }
    const textX = bb.x + currColumn * columnWidth;
    maxRowY = Math.max(
      maxRowY,
      addText(doc, text, { x: textX, y: lineY, w: columnWidth - colSpacer }).y
    );
    // addText(doc, '|', { x: textX + columnWidth - colSpacer, y: lineY, w: columnWidth - colSpacer });
    // addText(doc, '|', { x: textX + columnWidth, y: lineY, w: columnWidth - colSpacer });
    maxRowY += rowSpacer;
    currColumn++;
  });
  lineY = lineY + lineHeight - rowSpacer;
  return lineY;
}

class PDFCertificato {
  private docOptions: jsPDFOptions = {
    unit: UNIT,
    format: [DOC_SIZE.WIDTH, DOC_SIZE.HEIGHT],
    putOnlyUsedFonts: true,
    hotfixes: ["px_scaling"],
  };
  private certificato: CertificatoCompleto;
  private doc!: jsPDF;
  private totPages = 1;
  private footerYPerPage: number[] = [];
  private lineY = 0;
  private boundingBox!: Required<BoundingBox>;

  private addData(doc = this.doc) {
    setBaseText(doc);
    const x = BOUNDING_BOX.LEFT;
    let y = BOUNDING_BOX.TOP;
    const w = BOUNDING_BOX.WIDTH / 2;
    y = addText(doc, "Milan  " + gregToHebDate(this.certificato.emissione), {
      x,
      y,
      w,
    }).y;
    lineHeight = TEXT_LINE_HEIGHT;
    return addText(doc, toDateFormat(this.certificato.emissione) || "", {
      x,
      y,
      w,
    }).y;
  }

  private addAzienda(doc = this.doc) {
    let azienda = this.certificato.azienda;

    setBaseText(doc);

    const w = BOUNDING_BOX.WIDTH / 2;
    const x = BOUNDING_BOX.LEFT + w,
      y = BOUNDING_BOX.TOP;

    let line = y;
    line = addText(doc, "Spett.", { x, y: line, w }).y;
    line += 2;
    setBold(doc);
    line = addText(doc, azienda.nome, { x, y: line, w }).y;
    setNormal(doc);

    if (azienda.indirizzo)
      line = addText(doc, azienda.indirizzo, { x, y: line, w }).y;

    if (azienda.localita) {
      const provincia = azienda.provincia ? ` (${azienda.provincia})` : "";
      const cap = azienda.cap ? `${azienda.cap} ` : "";
      setBold(doc);
      line = addText(doc, cap + azienda.localita + provincia, {
        x,
        y: line,
        w,
      }).y;
    }

    if (azienda.nazione) {
      setBold(doc);
      line = addText(doc, azienda.nazione, { x, y: line, w }).y;
    }

    return line;
  }

  private addPageNumber(y: number, doc = this.doc) {
    setItalic(doc);
    doc.setFontSize(TEXT_SIZE * 0.8);
    doc.setTextColor("#505050");

    const w = BOUNDING_BOX.WIDTH;
    const x = BOUNDING_BOX.LEFT;

    // take space but don't print
    if (this.totPages <= 1) {
      return y + lineHeight;
    }

    const currentPage = doc.getCurrentPageInfo().pageNumber;
    const pageLabel = `PAGE ${currentPage} OF ${this.totPages}`;
    return addText(doc, pageLabel, { x, y, w }).y;
  }

  private printBrands(doc: jsPDF, brands: string[], y: number) {
    setH1(doc);
    return addCenteredText(doc, brands.join(" - "), {
      x: BOUNDING_BOX.LEFT,
      y: y,
      w: BOUNDING_BOX.WIDTH,
    }).y;
  }

  private addHeader(doc = this.doc) {
    let line = Math.max(this.addData(doc), this.addAzienda(doc));
    line += 5;
    line = this.addPageNumber(line, doc);

    {
      setBaseText(doc);
      const w = BOUNDING_BOX.WIDTH;
      const x = BOUNDING_BOX.LEFT;
      const textBound = addText(doc, "To the attention of the ", {
        x,
        y: line,
        w,
      });
      setBold(doc);
      line = addText(doc, "Supervising Rabbi / Kashrut Agency", {
        x: textBound.x + 80,
        y: line,
        w: w - textBound.x + x,
      }).y;
    }

    line += 10;

    {
      setBaseText(doc);
      const text = "This is to certify that the following products:";
      const x = BOUNDING_BOX.LEFT + BOUNDING_BOX.WIDTH / 5,
        w = BOUNDING_BOX.WIDTH;
      line = addText(doc, text, { x, y: line, w }).y;
    }

    if (this.certificato.brand) {
      line += HANDWRITE_SPACE * 2;
      line = this.printBrands(doc, [this.certificato.brand], line);
      line -= HANDWRITE_SPACE * 1;
    }

    line += HANDWRITE_SPACE * 2;

    return line;
  }

  private addFooter(y: number, doc = this.doc) {
    const azienda = this.certificato.azienda;
    const livelloKashrut = this.certificato.livelloKashrut;
    const passover = this.certificato.passover;
    const scadenza = toDateFormat(this.certificato.scadenza);
    let localitaProduzione = "";
    if (
      this.certificato.localitaProduzione ||
      this.certificato.nazioneProduzione
    ) {
      if (this.certificato.localitaProduzione) {
        localitaProduzione += this.certificato.localitaProduzione;
      }
      if (this.certificato.nazioneProduzione) {
        if (localitaProduzione != "") localitaProduzione += ", ";
        localitaProduzione += this.certificato.nazioneProduzione;
      }
    } else {
      localitaProduzione =
        azienda.localita +
        " (" +
        azienda.provincia +
        ")" +
        ", " +
        azienda.nazione;
    }

    let settimana = "";
    if(this.certificato.settimanaProduzione) {
      settimana = " on week " + this.certificato.settimanaProduzione + ", ";
    }

    let line = y;
    line += HANDWRITE_SPACE * 3;

    setBaseText(doc);

    line = addInlineTextsWithStyle(
      doc,
      [
        { text: "Produced by ", style: "normal" },
        { text: azienda.nome + ", ", style: "bold" },
        {
          text: localitaProduzione + ", ",
          style: "normal",
        },
        { text: settimana },
      ],
      { x: BOUNDING_BOX.LEFT, y: line, w: BOUNDING_BOX.WIDTH }
    ).y;

    line += HANDWRITE_SPACE;

    const livello = livelloKashrut
      ? livelloKashrut
      : passover
      ? "Kosher for Passover"
      : "Kosher";

    line = addInlineTextsWithStyle(
      doc,
      [
        { text: "are               ", style: "normal" },
        { text: livello, style: "bold" },
        {
          text: "                            under our supervision,",
          style: "normal",
        },
      ],
      { x: BOUNDING_BOX.LEFT, y: line, w: BOUNDING_BOX.WIDTH }
    ).y;

    line += HANDWRITE_SPACE;

    line = addInlineTextsWithStyle(
      doc,
      [
        {
          text: "Badatz   Mehadrin   Milan,   Italy,   Kashrut   Division.",
          style: "bold",
        },
      ],
      { x: BOUNDING_BOX.LEFT, y: line, w: BOUNDING_BOX.WIDTH }
    ).y;

    line += HANDWRITE_SPACE;

    if (scadenza) {
      const scadenzaGematriya = new HDate(new Date(this.certificato.scadenza))
        .renderGematriya()
        .split("")
        .reverse()
        .join("");
      line = addInlineTextsWithStyle(
        doc,
        [
          { text: "This certificate is valid until ", style: "normal" },
          { text: scadenza, style: "bold" },
          { text: "  " },
          {
            text: scadenzaGematriya,
            style: "bold",
            font: FONT_HEB,
            size: TEXT_SIZE + 2,
          },
        ],
        { x: BOUNDING_BOX.LEFT, y: line, w: BOUNDING_BOX.WIDTH }
      ).y;

      setBaseText(doc);
      line = addText(doc, "and is subject to renewal at that time.", {
        x: BOUNDING_BOX.LEFT,
        y: line,
        w: BOUNDING_BOX.WIDTH,
      }).y;

      line += HANDWRITE_SPACE;
    }

    const regardsX = BOUNDING_BOX.LEFT + BOUNDING_BOX.WIDTH * (2 / 3);
    line = addText(doc, "Our best regards,", { x: regardsX, y: line }).y;
    setBold(doc);
    line = addText(doc, "Rabbi Avraham Hazan", { x: regardsX, y: line }).y;
    line += HANDWRITE_SPACE * 4;

    return line;
  }

  private calculateBoundingBox() {
    let fakeDoc = new jsPDF(this.docOptions);
    let headY = this.addHeader(fakeDoc);
    let footerHeight = this.addFooter(0, fakeDoc);

    this.boundingBox = {
      x: BOUNDING_BOX.LEFT,
      y: headY,
      w: BOUNDING_BOX.WIDTH,
      h: BOUNDING_BOX.TOP + BOUNDING_BOX.HEIGHT - headY - footerHeight,
    };
  }

  private addBaseDecoration() {
    // header
    this.doc.addImage(
      this.certificato.passover ? HEADER_SRC_PASSOVER : HEADER_SRC,
      HEADER_EXT,
      0,
      0,
      HEADER_SIZE.WIDTH,
      HEADER_SIZE.HEIGHT
    );
    // footer
    const footerY = DOC_SIZE.HEIGHT - FOOTER_SIZE.HEIGHT;
    this.doc.addImage(
      FOOTER_SRC,
      FOOTER_EXT,
      0,
      footerY,
      FOOTER_SIZE.WIDTH,
      FOOTER_SIZE.HEIGHT
    );
  }

  private addBaseInformations() {
    this.addBaseDecoration();
    this.addHeader();
    // this.addFooter(this.boundingBox.y + this.boundingBox.h);
  }

  private init() {
    this.doc = new jsPDF(this.docOptions);
    this.calculateBoundingBox();
  }

  private raggruppaProdottiCertificato(): GruppoConNote[] {
    return this.certificato.prodottiCertificati.reduce(
      (previous: GruppoConNote[], prodottoCertificato) => {
        let result = previous;

        const nomeGruppo = prodottoCertificato.prodotto.gruppo.nome || "";
        const nomeProdotto = prodottoCertificato.prodotto.nome;

        let idxGruppo = result.findIndex((gruppo) => gruppo.nome == nomeGruppo);
        if (idxGruppo != -1) {
          result[idxGruppo].prodotti.push(nomeProdotto);
        } else {
          result.push({
            nome: nomeGruppo,
            note: prodottoCertificato.note || "",
            prodotti: [nomeProdotto],
          });
        }

        return [...previous];
      },
      []
    );
  }

  private writeGruppo(
    gruppo: GruppoConNote,
    numCols: number,
    colSpacer: number,
    rowSpacer: number,
    doc = this.doc,
    currLineY = this.lineY
  ) {
    let prodotti = gruppo.prodotti;
    const isGruppo = gruppo.nome;

    setH2(this.doc);
    if (isGruppo) {
      currLineY = addText(doc, gruppo.nome.toUpperCase(), {
        x: BOUNDING_BOX.LEFT,
        y: currLineY,
        w: BOUNDING_BOX.WIDTH,
      }).y;
      currLineY += 3;
      setBaseText(doc);
    } else prodotti = prodotti.map((p) => p.toUpperCase());

    currLineY = addTextColumns(
      doc,
      prodotti,
      numCols,
      {
        x: BOUNDING_BOX.LEFT,
        y: currLineY,
        w: BOUNDING_BOX.WIDTH,
      },
      colSpacer,
      rowSpacer
    );

    if (isGruppo && gruppo.note) {
      currLineY += 8;
      setSmallText(doc);
      setItalic(doc);
      doc.setTextColor("#404040");
      let noteX = addText(doc, "*", {
        x: BOUNDING_BOX.LEFT,
        y: currLineY,
        w: BOUNDING_BOX.WIDTH,
      }).x;
      currLineY = addText(doc, gruppo.note, {
        x: noteX + 5,
        y: currLineY,
        w: BOUNDING_BOX.WIDTH - noteX + BOUNDING_BOX.LEFT,
      }).y;
    }

    return currLineY;
  }

  private addPage() {
    this.doc.addPage();
    this.totPages += 1;
    this.lineY = this.boundingBox.y;
  }

  private printGruppo(gruppo: GruppoConNote) {
    const isGruppo = gruppo.nome;
    let prodotti = isGruppo
      ? gruppo.prodotti
      : gruppo.prodotti.map((p) => p.toUpperCase());

    const maxY = this.boundingBox.y + this.boundingBox.h;
    const maxColumns = 4;
    const colSpacer = 35;
    const rowSpacer = 2;

    const nCols = calculateColumns(
      this.doc,
      prodotti,
      BOUNDING_BOX.WIDTH,
      colSpacer,
      maxColumns
    );

    let forecast = this.writeGruppo(
      gruppo,
      nCols,
      colSpacer,
      rowSpacer,
      new jsPDF(this.docOptions),
      0
    );

    if (this.lineY + forecast > maxY) {
      // il gruppo sfora
      if (forecast > this.boundingBox.h) {
        // FIXME:
        // il gruppo è più alto della pagina
        // per ora balza !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        return;
      } else {
        this.footerYPerPage.push(this.lineY);
        this.addPage();
      }
    }
    this.lineY = this.writeGruppo(gruppo, nCols, colSpacer, rowSpacer);
  }

  private addProducts() {
    this.lineY = this.boundingBox.y;

    const compareGruppiConNote = (a: any, b: any) => {
      const nameA = a.nome.toUpperCase(); // ignore upper and lowercase
      const nameB = b.nome.toUpperCase(); // ignore upper and lowercase
      if (nameA < nameB) {
        return -1;
      }
      if (nameA > nameB) {
        return 1;
      }

      // names must be equal
      return 0;
    };

    const gruppi =
      this.raggruppaProdottiCertificato().sort(compareGruppiConNote);
    gruppi.forEach((gruppo) => {
      if (this.lineY != this.boundingBox.y) this.lineY += HANDWRITE_SPACE * 2;
      this.printGruppo(gruppo);
    });

    this.footerYPerPage.push(this.lineY);
  }

  private addFinalInfo() {
    for (let i = 0; i < this.totPages; i++) {
      this.doc.setPage(i + 1);
      this.addBaseInformations();
      this.addFooter(this.footerYPerPage[i]);
    }
  }

  constructor(certificato: CertificatoCompleto) {
    this.certificato = certificato;
    // let brands = ['SIMMENTHAL', 'RIO MARE'];
    // this.certificato.brandCertificati = brands.map(b => ({ nome: b, idCertificato: this.certificato.id }));
    this.init(); // initialize private fields
    this.addProducts();
    this.addFinalInfo();
  }

  public save() {
    const fileName =
      this.certificato.emissione.replaceAll("-", "") +
      "_" +
      this.certificato.azienda.nome.replaceAll(" ", "_") +
      ".pdf";

    this.doc.save(fileName);
  }
}

export default PDFCertificato;
