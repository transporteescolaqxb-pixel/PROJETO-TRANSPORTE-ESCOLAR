import { jsPDF } from "jspdf";
import { FormData } from "../types";
import { INSTITUTIONAL_LOGO } from "../constants";

export const generatePDF = async (data: FormData): Promise<File> => {
  const doc = new jsPDF();

  // Página 1: Dados e Foto de Rosto
  // Colors
  const primaryColor = "#1e3a8a"; // Blue 900

  // Header Background
  doc.setFillColor(30, 58, 138); 
  doc.rect(0, 0, 210, 40, "F");

  // Logo Fixo no PDF (Header)
  try {
    doc.addImage(INSTITUTIONAL_LOGO, "PNG", 10, 8, 24, 24);
  } catch (e) {
    console.error("Erro ao adicionar logo institucional no PDF", e);
  }

  // Title (Ajustado para dar espaço ao logo)
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("UNIBADGE CADASTRO DIGITAL", 115, 20, { align: "center" });
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Ficha de Cadastro Universitário e Transporte", 115, 30, { align: "center" });

  doc.setTextColor(0, 0, 0);

  // Face Photo
  let yPos = 55;
  if (data.photoPreviewUrl) {
    try {
      doc.addImage(data.photoPreviewUrl, "JPEG", 150, 50, 40, 53);
      doc.setDrawColor(30, 58, 138);
      doc.setLineWidth(0.5);
      doc.rect(150, 50, 40, 53);
    } catch (e) {
      console.error("Error adding face photo to PDF", e);
    }
  }

  // Data Section
  const leftMargin = 20;
  const labelOffset = 6;
  const contentOffset = 13;
  const lineSpacing = 16;

  const addField = (label: string, value: string) => {
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(primaryColor);
    doc.text(label.toUpperCase(), leftMargin, yPos);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    const splitText = doc.splitTextToSize(value.toUpperCase() || "-", 120);
    doc.text(splitText, leftMargin, yPos + labelOffset);

    doc.setDrawColor(220, 220, 220);
    doc.line(leftMargin, yPos + contentOffset, 140, yPos + contentOffset);

    yPos += lineSpacing + ((splitText.length - 1) * 5);
  };

  addField("Nome Completo", data.fullName);
  addField("CPF", data.cpf);
  addField("Cidade / Distrito", data.cityDistrict);
  addField("Endereço", data.address);
  addField("Instituição", data.institution);
  addField("Curso / Cargo", data.courseRole);
  addField("Ponto de Embarque", data.boardingPoint);
  addField("Ônibus/Motorista (Ida)", data.busDriverGo);
  addField("Turno", data.shift);

  // Footer Página 1
  const date = new Date().toLocaleDateString("pt-BR");
  const time = new Date().toLocaleTimeString("pt-BR");
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(`Gerado em: ${date} às ${time}`, 105, 280, { align: "center" });
  doc.text("UniBadge - Cadastro Digital - Página 1", 105, 285, { align: "center" });

  // Página 2: Declaração
  if (data.declarationPreviewUrl) {
    doc.addPage();
    
    // Header Página 2
    doc.setFillColor(30, 58, 138); 
    doc.rect(0, 0, 210, 25, "F");

    // Logo na Página 2
    try {
      doc.addImage(INSTITUTIONAL_LOGO, "PNG", 5, 2, 20, 20);
    } catch (e) {}

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("DECLARAÇÃO DE MATRÍCULA / VÍNCULO", 110, 16, { align: "center" });

    try {
      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 10;
      const maxWidth = pageWidth - (margin * 2);
      const maxHeight = pageHeight - 35 - margin;

      doc.addImage(data.declarationPreviewUrl, "JPEG", margin, 35, maxWidth, maxHeight, undefined, 'MEDIUM');
    } catch (e) {
      console.error("Error adding declaration to PDF", e);
      doc.setTextColor(255, 0, 0);
      doc.text("Erro ao carregar imagem da declaração.", 105, 100, { align: "center" });
    }

    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`UniBadge - Cadastro Digital - Página 2`, 105, 285, { align: "center" });
  }

  const safeName = data.fullName.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'cadastro';
  const filename = `unibadge_${safeName}.pdf`;
  
  doc.save(filename);

  const blob = doc.output('blob');
  return new File([blob], filename, { type: "application/pdf" });
};