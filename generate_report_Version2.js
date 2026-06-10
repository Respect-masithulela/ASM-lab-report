'use strict';
const fs = require('fs');
const { Document, Packer, Header, Footer, Paragraph, TextRun, PageNumber,
        BorderStyle, AlignmentType, ShadingType, LevelFormat } = require('docx');
const { C, borders, t, tb } = require('./report_helpers');

const part1 = require('./report_part1');
const part2 = require('./report_part2');
const part3 = require('./report_part3');

const allChildren = [
  ...part1.children,
  ...part2.children,
  ...part3.children,
];

const doc = new Document({
  numbering: {
    config: [
      {
        reference: "bul",
        levels: [{
          level: 0, format: LevelFormat.BULLET, text: "\u2022",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } }
        }]
      },
      {
        reference: "num",
        levels: [{
          level: 0, format: LevelFormat.DECIMAL, text: "%1.",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } }
        }]
      },
      {
        reference: "ref",
        levels: [{
          level: 0, format: LevelFormat.BULLET, text: "",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 720 } } }
        }]
      },
    ]
  },

  styles: {
    default: { document: { run: { font: "Arial", size: 22 } } },
    paragraphStyles: [
      {
        id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal",
        quickFormat: true,
        run: { size: 34, bold: true, font: "Arial", color: C.navy },
        paragraph: { spacing: { before: 280, after: 160 }, outlineLevel: 0 }
      },
      {
        id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal",
        quickFormat: true,
        run: { size: 26, bold: true, font: "Arial", color: C.blue },
        paragraph: { spacing: { before: 220, after: 100 }, outlineLevel: 1 }
      },
      {
        id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal",
        quickFormat: true,
        run: { size: 23, bold: true, font: "Arial", color: "0D7377" },
        paragraph: { spacing: { before: 160, after: 80 }, outlineLevel: 2 }
      },
    ]
  },

  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1260, right: 1260, bottom: 1260, left: 1440 }
      }
    },
    headers: {
      default: new Header({
        children: [
          new Paragraph({
            border: {
              bottom: { style: BorderStyle.SINGLE, size: 4, color: C.blue, space: 1 }
            },
            children: [
              tb("ASM Lab Mine Ventilation Software — Technical Report",
                 { size: 18, color: "595959" }),
              t("   |   University of the Witwatersrand  ·  2026",
                { size: 18, color: "AAAAAA" }),
            ]
          })
        ]
      })
    },
    footers: {
      default: new Footer({
        children: [
          new Paragraph({
            border: {
              top: { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC", space: 1 }
            },
            alignment: AlignmentType.CENTER,
            children: [
              t("Page ", { size: 18, color: "595959" }),
              new TextRun({
                children: [PageNumber.CURRENT],
                font: "Arial", size: 18, color: "595959"
              }),
              t(" of ", { size: 18, color: "595959" }),
              new TextRun({
                children: [PageNumber.TOTAL_PAGES],
                font: "Arial", size: 18, color: "595959"
              }),
            ]
          })
        ]
      })
    },
    children: allChildren,
  }]
});

console.log(`Total content paragraphs/elements: ${allChildren.length}`);

Packer.toBuffer(doc)
  .then(buf => {
    fs.writeFileSync('./ASM_Lab_Full_Report.docx', buf);
    const mb = (buf.length / 1048576).toFixed(2);
    console.log(`\n✅ Success!`);
    console.log(`📄 Document size: ${buf.length.toLocaleString()} bytes (${mb} MB)`);
    console.log(`📁 Saved to: ./ASM_Lab_Full_Report.docx`);
  })
  .catch(err => {
    console.error('❌ Build failed:', err.message);
    process.exit(1);
  });