function doGet(e) {
    return HtmlService.createTemplateFromFile('index')
        .evaluate()
        .setTitle('Daily Work Log')
        .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function include(filename) {
    return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function saveData(formData) {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var date = new Date(formData.date);
    var year = date.getFullYear();
    var month = date.getMonth();
    var monthNames = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
    ];
    var sheetName = monthNames[month] + ' ' + year;
    var sheet = ss.getSheetByName(sheetName);

    if (!sheet) {
        sheet = ss.insertSheet(sheetName);
        sheet.appendRow([
            'Date',
            'Name',
            'Department',
            'startTime',
            'endTime',
            'Task',
            'Notes',
            'accomplishments',
            'challenges',
            'Plan/Next Step',
            'additionalNotes',
        ]);
    }

    sheet.appendRow([
        formData.date,
        formData.name,
        formData.department,
        formData.startTime,
        formData.endTime,
        formData.task,
        formData.notes,
        formData.accomplishments,
        formData.challenges,
        formData.plan,
        formData.additionalNotes,
    ]);
}

function getReports(month, year, name) {
    month = month || '';
    year = year || '';
    name = name || '';

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheets = ss.getSheets();
    var allReports = [];

    for (var i = 0; i < sheets.length; i++) {
        var sheet = sheets[i];
        var sheetName = sheet.getName();
        var monthYearMatch = sheetName.match(
            /(January|February|March|April|May|June|July|August|September|October|November|December)\s(\d{4})/i
        );

        if (monthYearMatch) {
            var sheetMonth = monthYearMatch[1];
            var sheetYear = monthYearMatch[2];
            var monthIndex = [
                'january',
                'february',
                'march',
                'april',
                'may',
                'june',
                'july',
                'august',
                'september',
                'october',
                'november',
                'december',
            ].indexOf(sheetMonth.toLowerCase());

            var monthMatch = month === '' || monthIndex === parseInt(month);
            var yearMatch = year === '' || sheetYear === year;

            if (monthMatch && yearMatch) {
                var data = sheet.getDataRange().getValues();
                var headers = data[0].map(function (h) {
                    return h.toString().toLowerCase().trim();
                });

                for (var j = 1; j < data.length; j++) {
                    var row = data[j];
                    var report = {};

                    for (var k = 0; k < headers.length; k++) {
                        report[headers[k]] = row[k]
                            ? row[k].toString().trim()
                            : '';
                    }

                    var nameMatch =
                        name === '' ||
                        (report.name &&
                            report.name.toLowerCase() === name.toLowerCase());

                    if (nameMatch) {
                        allReports.push(report);
                    }
                }
            }
        }
    }

    allReports.sort(function (a, b) {
        return new Date(b.date) - new Date(a.date);
    });

    return allReports;
}

function getAvailableYears() {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheets = ss.getSheets();
    var years = new Set();

    for (var i = 0; i < sheets.length; i++) {
        var sheetName = sheets[i].getName();
        var yearMatch = sheetName.match(/(\d{4})$/);
        if (yearMatch) years.add(yearMatch[1]);
    }

    return Array.from(years).sort().reverse();
}

function getAvailableNames() {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheets = ss.getSheets();
    var names = new Set();

    for (var i = 0; i < sheets.length; i++) {
        var sheet = sheets[i];
        var sheetName = sheet.getName();

        if (
            sheetName.match(
                /(January|February|March|April|May|June|July|August|September|October|November|December)\s(\d{4})/
            )
        ) {
            var data = sheet.getDataRange().getValues();
            var nameIndex = data[0].indexOf('Name');

            if (nameIndex !== -1) {
                for (var j = 1; j < data.length; j++) {
                    if (data[j][nameIndex]) names.add(data[j][nameIndex]);
                }
            }
        }
    }

    return Array.from(names).sort();
}

function getReportById(month, year, name, dateString) {
    try {
        var ss = SpreadsheetApp.getActiveSpreadsheet();
        var sheetName = getMonthName(parseInt(month)) + ' ' + year;
        var sheet = ss.getSheetByName(sheetName);

        console.log(
            'getReportById: ' +
                month +
                ' ' +
                year +
                ' ' +
                name +
                ' ' +
                dateString
        );

        console.log('getReportById: : ' + ss + ' ' + sheetName + ' ' + sheet);

        if (!sheet) {
            // ถ้าไม่พบ sheet ให้ค้นหาใน sheet อื่น
            var sheets = ss.getSheets();
            for (var i = 0; i < sheets.length; i++) {
                var currentSheet = sheets[i];
                var data = currentSheet.getDataRange().getValues();

                for (var j = 1; j < data.length; j++) {
                    var rowDate = new Date(data[j][0]);
                    var rowDateStr = Utilities.formatDate(
                        rowDate,
                        Session.getScriptTimeZone(),
                        'yyyy-MM-dd'
                    );
                    var targetDate = new Date(dateString);
                    var targetDateStr = Utilities.formatDate(
                        targetDate,
                        Session.getScriptTimeZone(),
                        'yyyy-MM-dd'
                    );

                    if (rowDateStr === targetDateStr && data[j][1] === name) {
                        sheet = currentSheet;
                        sheetName = currentSheet.getName();
                        break;
                    }
                }
                if (sheet) break;
            }
            if (!sheet) throw new Error('No matching data found in any sheet');
        }

        var data = sheet.getDataRange().getValues();
        var headers = data[0];

        // หาแถวที่ตรงกับวันที่และชื่อที่ระบุ
        for (var i = 1; i < data.length; i++) {
            var row = data[i];
            var rowDate = new Date(row[0]);
            var rowDateStr = Utilities.formatDate(
                rowDate,
                Session.getScriptTimeZone(),
                'yyyy-MM-dd'
            );
            var targetDate = new Date(dateString);
            var targetDateStr = Utilities.formatDate(
                targetDate,
                Session.getScriptTimeZone(),
                'yyyy-MM-dd'
            );

            if (rowDateStr === targetDateStr && row[1] === name) {
                var report = {};
                for (var j = 0; j < headers.length; j++) {
                    var header = headers[j].toString().toLowerCase().trim();
                    var value = row[j];

                    // แปลงเวลาให้ถูกต้อง
                    if (
                        (header === 'starttime' || header === 'endtime') &&
                        typeof value === 'number'
                    ) {
                        var date = new Date(value * 24 * 60 * 60 * 1000);
                        value = Utilities.formatDate(
                            date,
                            Session.getScriptTimeZone(),
                            'HH:mm'
                        );
                    }

                    report[header] = value ? value.toString().trim() : '';
                }

                return {
                    report: report,
                    sheetName: sheetName,
                    rowNumber: i + 1, // คืนค่าเลขแถวที่ถูกต้อง (ฐาน 1)
                };
            }
        }

        throw new Error('Report not found in sheet');
    } catch (e) {
        console.error('Error in getReportById:', e);
        throw e;
    }
}

function updateReport(sheetName, rowNumber, updatedData) {
    try {
        var ss = SpreadsheetApp.getActiveSpreadsheet();
        var sheet = ss.getSheetByName(sheetName);

        if (!sheet) throw new Error('Sheet not found: ' + sheetName);

        var headers = sheet
            .getRange(1, 1, 1, sheet.getLastColumn())
            .getValues()[0];
        var rowData = [];

        // ตรวจสอบว่าแถวที่ต้องการอัพเดทมีอยู่จริง
        if (rowNumber > sheet.getLastRow() || rowNumber < 2) {
            throw new Error('Invalid row number for update');
        }

        // เตรียมข้อมูลสำหรับอัพเดทตามโครงสร้างหัวตาราง
        for (var i = 0; i < headers.length; i++) {
            var header = headers[i].toString().toLowerCase().trim();
            var value = '';

            switch (header) {
                case 'date':
                    value = updatedData.date || '';
                    break;
                case 'name':
                    value = updatedData.name || '';
                    break;
                case 'department':
                    value = updatedData.department || '';
                    break;
                case 'starttime':
                    value = updatedData.startTime || '';
                    break;
                case 'endtime':
                    value = updatedData.endTime || '';
                    break;
                case 'task':
                    value = updatedData.task || '';
                    break;
                case 'notes':
                    value = updatedData.notes || '';
                    break;
                case 'accomplishments':
                    value = updatedData.accomplishments || '';
                    break;
                case 'challenges':
                    value = updatedData.challenges || '';
                    break;
                case 'plan/next step':
                    value = updatedData.plan || '';
                    break;
                case 'additionalnotes':
                    value = updatedData.additionalNotes || '';
                    break;
                default:
                    value = '';
            }

            rowData.push(value);
        }

        // อัพเดทเฉพาะแถวที่เลือก
        sheet.getRange(rowNumber, 1, 1, rowData.length).setValues([rowData]);
        return true;
    } catch (e) {
        console.error('Error in updateReport:', e);
        throw e;
    }
}

function getSpreadsheetUrl() {
    return SpreadsheetApp.getActiveSpreadsheet().getUrl();
}

function getMonthName(monthIndex) {
    var monthNames = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
    ];
    return monthNames[monthIndex];
}
