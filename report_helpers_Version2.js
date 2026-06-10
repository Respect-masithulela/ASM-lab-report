'use strict';
const {
  Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, BorderStyle, WidthType, ShadingType,
  LevelFormat, PageBreak, VerticalAlign
} = require('docx');

const W = 9360;
const C = {
  navy:"1F4E79",blue:"2E75B6",teal:"0D7377",green:"375623",
  orange:"C55A11",red:"C00000",purple:"7B2D8B",grey:"595959",
  bgBlue:"DEEAF1",bgGreen:"E2EFDA",bgOrange:"FCE9D9",
  bgRed:"FCE4D6",bgGrey:"F2F2F2",bgYellow:"FFF2CC",bgPurple:"F3E6F8",
};

const bdr = (c) => ({style:BorderStyle.SINGLE,size:2,color:c||"AAAAAA"});
const borders = (c) => {const b=bdr(c);return {top:b,bottom:b,left:b,right:b};};
const pad  = {top:80,bottom:80,left:120,right:120};
const padS = {top:60,bottom:60,left:100,right:100};

const t   = (text,o) => new TextRun(Object.assign({text,font:"Arial",size:22},o||{}));
const tb  = (text,o) => new TextRun(Object.assign({text,font:"Arial",size:22,bold:true},o||{}));
const ti  = (text,o) => new TextRun(Object.assign({text,font:"Arial",size:22,italics:true},o||{}));
const tm  = (text,o) => new TextRun(Object.assign({text,font:"Courier New",size:20},o||{}));

const p   = (ch,o) => new Paragraph(Object.assign({spacing:{before:80,after:80},alignment:AlignmentType.JUSTIFIED,children:ch},o||{}));
const pc  = (ch,o) => new Paragraph(Object.assign({spacing:{before:60,after:60},children:ch},o||{}));
const h1  = (text) => new Paragraph({heading:HeadingLevel.HEADING_1,pageBreakBefore:true,spacing:{before:280,after:160},children:[new TextRun({text,font:"Arial",size:34,bold:true,color:C.navy})]});
const h2  = (text) => new Paragraph({heading:HeadingLevel.HEADING_2,spacing:{before:220,after:100},children:[new TextRun({text,font:"Arial",size:26,bold:true,color:C.blue})]});
const h3  = (text) => new Paragraph({heading:HeadingLevel.HEADING_3,spacing:{before:160,after:80},children:[new TextRun({text,font:"Arial",size:23,bold:true,color:C.teal})]});
const sp  = (a,b)  => new Paragraph({spacing:{before:b||40,after:a||120},children:[]});
const eq  = (text) => new Paragraph({spacing:{before:100,after:100},alignment:AlignmentType.CENTER,shading:{fill:"F8F9FA",type:ShadingType.CLEAR},border:{top:{style:BorderStyle.SINGLE,size:2,color:"DDDDDD"},bottom:{style:BorderStyle.SINGLE,size:2,color:"DDDDDD"},left:{style:BorderStyle.NONE,size:0},right:{style:BorderStyle.NONE,size:0}},children:[new TextRun({text,font:"Cambria Math",size:24,italics:true})]});

const bul  = (text) => new Paragraph({numbering:{reference:"bul",level:0},spacing:{before:40,after:40},children:[t(text)]});
const num_ = (text) => new Paragraph({numbering:{reference:"num",level:0},spacing:{before:50,after:50},children:[t(text)]});
const ref_ = (text) => new Paragraph({numbering:{reference:"ref",level:0},spacing:{before:60,after:60},children:[t(text,{size:21})]});

const divider = () => new Paragraph({border:{bottom:{style:BorderStyle.SINGLE,size:8,color:C.blue,space:1}},spacing:{before:160,after:160},children:[]});

const figNote = (num,text) => new Paragraph({spacing:{before:60,after:160},alignment:AlignmentType.CENTER,children:[tb("Figure "+num+": ",{size:20,color:C.grey}),t(text,{size:20,italics:true,color:C.grey})]});
const tabNote = (num,text) => new Paragraph({spacing:{before:60,after:160},alignment:AlignmentType.CENTER,children:[tb("Table "+num+": ",{size:20,color:C.grey}),t(text,{size:20,italics:true,color:C.grey})]});

function figPH(num,cap) {
  return new Table({width:{size:W,type:WidthType.DXA},columnWidths:[W],rows:[new TableRow({children:[new TableCell({
    borders:borders("BBBBBB"),width:{size:W,type:WidthType.DXA},
    margins:{top:500,bottom:500,left:200,right:200},
    shading:{fill:"F5F5F5",type:ShadingType.CLEAR},
    children:[
      new Paragraph({alignment:AlignmentType.CENTER,children:[tb("[ FIGURE "+num+" -- INSERT SOFTWARE SCREENSHOT ]",{color:"999999",size:19})]}),
      new Paragraph({alignment:AlignmentType.CENTER,children:[t(cap,{color:"AAAAAA",size:18,italics:true})]})
    ]
  })]})]}); 
}

function hc(text,fill,w) {
  return new TableCell({borders:borders(fill),width:{size:w,type:WidthType.DXA},margins:padS,shading:{fill,type:ShadingType.CLEAR},verticalAlign:VerticalAlign.CENTER,children:[new Paragraph({alignment:AlignmentType.CENTER,children:[new TextRun({text,font:"Arial",size:20,bold:true,color:"FFFFFF"})]})]});
}

function dc(text,w,fill,bold,color,align) {
  return new TableCell({
    borders:borders("CCCCCC"),width:{size:w,type:WidthType.DXA},margins:padS,
    shading:{fill:fill||"FFFFFF",type:ShadingType.CLEAR},
    children:[new Paragraph({alignment:align||AlignmentType.LEFT,children:[new TextRun({text,font:"Arial",size:20,bold:!!bold,color:color||"1A1A1A"})]})]
  });
}

function mc(text,w,fill) {
  return new TableCell({
    borders:borders("CCCCCC"),width:{size:w,type:WidthType.DXA},margins:padS,
    shading:{fill:fill||"FAFAFA",type:ShadingType.CLEAR},
    children:[new Paragraph({alignment:AlignmentType.CENTER,children:[new TextRun({text,font:"Courier New",size:19,color:"333333"})]})]
  });
}

function box(label,color,bg,content) {
  return new Table({width:{size:W,type:WidthType.DXA},columnWidths:[W],rows:[
    new TableRow({children:[new TableCell({borders:borders(color),width:{size:W,type:WidthType.DXA},margins:{top:60,bottom:60,left:120,right:120},shading:{fill:color,type:ShadingType.CLEAR},children:[new Paragraph({children:[new TextRun({text:label,font:"Arial",size:19,bold:true,color:"FFFFFF",allCaps:true})]})]})]}) ,
    new TableRow({children:[new TableCell({borders:borders(color),width:{size:W,type:WidthType.DXA},margins:pad,shading:{fill:bg,type:ShadingType.CLEAR},children:content})]})
  ]});
}

module.exports = {W,C,borders,pad,padS,t,tb,ti,tm,p,pc,h1,h2,h3,sp,eq,bul,num_,ref_,divider,figNote,tabNote,figPH,hc,dc,mc,box};