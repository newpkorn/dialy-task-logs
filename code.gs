function doGet(e) {
    return HtmlService.createTemplateFromFile('index')
        .evaluate()
        .setTitle('Daily Task Log')
        .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function include(filename) {
    return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function saveData(formData) {
    try {
        var ss = SpreadsheetApp.getActiveSpreadsheet();

        // รับวันที่ในรูปแบบ YYYY-MM-DD โดยตรง
        var dateParts = formData.date.split('-');
        var date = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);

        // ตรวจสอบว่าวันที่ถูกต้อง
        if (isNaN(date.getTime())) {
            throw new Error(
                'Invalid date format. Expected YYYY-MM-DD but got ' +
                    formData.date
            );
        }

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

        console.log('Creating/accessing sheet:', sheetName); // สำหรับ debug

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
                'Accomplishments',
                'Challenges',
                'Plan/Next Steps',
                'additionalNotes',
            ]);
        }

        // ใช้รูปแบบวันที่เดิม (YYYY-MM-DD) สำหรับบันทึกลง Sheets
        sheet.appendRow([
            formData.date, // ใช้รูปแบบเดิมที่รับมา
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

        return true;
    } catch (e) {
        console.error('Error in saveData:', e);
        throw new Error('Failed to save data: ' + e.message);
    }
}

function getReports(specificDate, month, year, name) {
    month = month || '';
    year = year || '';
    specificDate = specificDate || '';
    name = name || '';

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheets = ss.getSheets();
    var allReports = [];

    // แปลงวันที่ถ้ามีค่า (จากรูปแบบ dd/mm/yyyy เป็น yyyy-mm-dd)
    var targetDate = '';
    if (specificDate) {
        var dateParts = specificDate.split('/');
        if (dateParts.length === 3) {
            targetDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
        }
    }

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
                    var reportDate = new Date(row[0]);
                    var reportDateStr = Utilities.formatDate(
                        reportDate,
                        Session.getScriptTimeZone(),
                        'yyyy-MM-dd'
                    );

                    // ตรวจสอบวันที่
                    var dateMatch = true;
                    if (targetDate && reportDateStr !== targetDate) {
                        dateMatch = false;
                    }

                    if (dateMatch) {
                        var report = {
                            sheetName: sheetName,
                            rowNumber: j + 1,
                        };

                        for (var k = 0; k < headers.length; k++) {
                            var header = headers[k].toString().trim();
                            var value = row[k];

                            if (header === 'Plan/Next Steps') {
                                report['plan'] = value
                                    ? value.toString().trim()
                                    : '';
                            }

                            report[header] = value
                                ? value.toString().trim()
                                : '';
                        }

                        var nameMatch =
                            name === '' ||
                            (report.name &&
                                report.name.toLowerCase() ===
                                    name.toLowerCase());

                        if (nameMatch) {
                            allReports.push(report);
                        }
                    }
                }
            }
        }
    }

    // เรียงลำดับตามวันที่ (ใหม่ไปเก่า)
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
        const ss = SpreadsheetApp.getActiveSpreadsheet();
        const sheet = ss.getSheetByName(sheetName);

        if (!sheet) throw new Error(`Sheet not found: ${sheetName}`);
        if (rowNumber < 2 || rowNumber > sheet.getLastRow()) {
            throw new Error(`Invalid row number: ${rowNumber}`);
        }

        const headers = sheet
            .getRange(1, 1, 1, sheet.getLastColumn())
            .getValues()[0];
        const newData = headers.map((header) => {
            header = header.toString().trim().toLowerCase();

            if (header === 'date') return updatedData.date;
            if (header === 'name') return updatedData.name;
            if (header === 'department') return updatedData.department;
            if (header === 'starttime') return updatedData.startTime || '';
            if (header === 'endtime') return updatedData.endTime || '';
            if (header === 'task') return updatedData.task;
            if (header === 'notes') return updatedData.notes;
            if (header === 'accomplishments')
                return updatedData.accomplishments;
            if (header === 'challenges') return updatedData.challenges;
            if (header === 'plan/next steps') return updatedData.plan;
            if (header === 'additionalnotes')
                return updatedData.additionalNotes;

            return ''; // Default value if header not matched
        });

        console.log('Updating with:', newData);
        sheet.getRange(rowNumber, 1, 1, newData.length).setValues([newData]);

        return true;
    } catch (e) {
        console.error('Update failed:', e);
        throw new Error(`Update failed: ${e.message}`);
    }
}

function deleteReport(sheetName, rowNumber) {
    try {
        var ss = SpreadsheetApp.getActiveSpreadsheet();
        var sheet = ss.getSheetByName(sheetName);

        if (!sheet) {
            throw new Error('Sheet not found: ' + sheetName);
        }

        // ตรวจสอบว่าแถวที่ต้องการลบมีอยู่จริง
        if (rowNumber < 2 || rowNumber > sheet.getLastRow()) {
            throw new Error('Invalid row number for deletion: ' + rowNumber);
        }

        // ลบแถว
        sheet.deleteRow(rowNumber);
        return true;
    } catch (e) {
        console.error('Error in deleteReport:', e);
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

function logHeaders() {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheets = ss.getSheets();
    sheets.forEach((sheet) => {
        var headers = sheet
            .getRange(1, 1, 1, sheet.getLastColumn())
            .getValues()[0];
        console.log(sheet.getName() + ' headers:', headers);
    });
}
