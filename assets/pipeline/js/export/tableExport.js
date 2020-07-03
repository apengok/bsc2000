function exportExcel(excel) {
	var reg = new RegExp("","g");
	excel.replace(reg, "undefined");
	var excelFile = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:x='urn:schemas-microsoft-com:office:excel' xmlns='http://www.w3.org/TR/REC-html40'>";
	excelFile += "<head>";
	excelFile += "<!--[if gte mso 9]>";
	excelFile += "<xml>";
	excelFile += "<x:ExcelWorkbook>";
	excelFile += "<x:ExcelWorksheets>";
	excelFile += "<x:ExcelWorksheet>";
	excelFile += "<x:Name>";
	excelFile += "{worksheet}";
	excelFile += "</x:Name>";
	excelFile += "<x:WorksheetOptions>";
	excelFile += "<x:DisplayGridlines/>";
	excelFile += "</x:WorksheetOptions>";
	excelFile += "</x:ExcelWorksheet>";
	excelFile += "</x:ExcelWorksheets>";
	excelFile += "</x:ExcelWorkbook>";
	excelFile += "</xml>";
	excelFile += "<![endif]-->";
	excelFile += "</head>";
	excelFile += "<body>";
	excelFile += excel;
	excelFile += "</body>";
	excelFile += "</html>";

	var b = new Base64(); 
	var base64data = "base64," +  b.encode(excelFile);
	window.open('data:application/vnd.ms-excel;filename=exportData.doc;' + base64data);
	
}