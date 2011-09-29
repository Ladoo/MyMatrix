// Extracted from HTML source of Bulk File Import Tool
// Only necessary for Google Chrome
// Slightly modified:
// - init function is no longer called (since it's called on page load)
// - some variables are defined manually (this.table and this.tbody) since they're usually declared in the init() function

if ( (typeof(myMatrix) !== "undefined") && myMatrix.isCorrectFrame() ) {

    function local_file_import_table()
    {
        this.table = document.getElementById("bulk_file_import_table_container").children[0];
        this.tbody = this.table.children[1];
        this.id_count = 1;
        this.file_names = Array();

        // Browser Compatibility
        this.is_gecko = (navigator.product == 'Gecko');
        this.is_ie = (
                        (navigator.userAgent.toLowerCase().indexOf("msie") != -1)
                    );

        // Allowed extension for each file type
        this.image_exts = Array('jpg', 'jpeg', 'gif', 'png');
        this.doc_exts = Array('doc', 'dot', 'docx');
        this.pdf_exts = Array('pdf');
        this.xls_exts = Array('xls', 'xlt', 'xlsx', 'xlsm', 'xltx', 'xltm');
        this.rtf_exts = Array('rtf');
        this.txt_exts = Array('txt');
        this.js_exts = Array('js');
        this.ppt_exts = Array('ppt', 'pps', 'pot', 'pptx', 'ppsx', 'potx', 'pptm', 'potm', 'ppsm');
        this.css_exts = Array('css');
        this.mp3_exts = Array('mp3');
        this.video_exts = Array('mov', 'avi', 'wmv', 'asf', 'flv', 'mp4', 'm4v', 'mpg', 'mpeg');

        // Create the initial table for local import
        this.init = function()
        {
            var container = document.getElementById('bulk_file_import_table_container');

            this.table.className = 'sq-backend-table';
            this.table.style.width = '600px';

            // Create THead
            var thead = document.createElement('thead');
            var header_row = document.createElement('tr');
            var th = document.createElement('th');
            th.colSpan = '3';
            th.className = 'sq-backend-table-header';
            th.style.width = '100px';
            th.innerHTML = 'Files to Import';
            header_row.appendChild(th);
            thead.appendChild(header_row);

            // Create TBody
            var tbody = document.createElement('tbody');
            var body_row = document.createElement('tr');
            var row_id = 'bulk_file_upload_new_row_0';
            body_row.id = row_id;
            var td_1 = document.createElement('td');
            var td_2 = document.createElement('td');
            var td_3 = document.createElement('td');

            td_1.className = 'sq-backend-table-cell';
            td_2.className = 'sq-backend-table-cell';
            td_3.className = 'sq-backend-table-cell';

            td_1.style.borderTop = '1px solid #1A1A1A';
            td_2.style.borderTop = '1px solid #1A1A1A';
            td_3.style.borderTop = '1px solid #1A1A1A';

            td_1.style.width = '100px';
            td_2.style.width = '470px';
            td_3.style.width = '30px';

            td_1.innerHTML = '<b>Choose File</b>';
            td_2.innerHTML = '<input type="file" size="50" name="bulk_file_upload_file_chooser_0" id="bulk_file_upload_file_chooser_0" class="sq-form-field" onchange="local_file_table.fileSelected(this, \'0\');" />';
            td_3.innerHTML = '<img title="Delete News" src="http://ladoo.com.au/__data/asset_types/bodycopy/images/icons/delete.png" onclick="local_file_table.removeRow(\'0\', true);">';

            body_row.appendChild(td_1);
            body_row.appendChild(td_2);
            body_row.appendChild(td_3);
            tbody.appendChild(body_row);
            this.tbody = tbody;

            // Create TFoot
            var tfoot = document.createElement('tfoot');
            var footer_row = document.createElement('tr');
            var td = document.createElement('td');
            td.className = 'sq-backend-table-cell';
            td.colSpan = '3';
            td.align = 'right';
            td.style.borderTop = '1px solid #000000';
            td.innerHTML = '<div id="insert_file_link" onclick="local_file_table.addRow();"><b>[Click Here to Add]</b></div>';
            footer_row.appendChild(td);
            tfoot.appendChild(footer_row);

            // Append all
            this.table.appendChild(thead);
            this.table.appendChild(tbody);
            this.table.appendChild(tfoot);
            container.appendChild(this.table);

        }//end init()


        this.addRow = function()
        {
            this.children = this.tbody.childNodes;
            this.tbody.appendChild(this._newRow(this.id_count));
            this.id_count++;

        }//end addRow()

        this._newRow = function(id)
        {
            var new_tr = document.createElement('tr');
            var row_id = 'bulk_file_upload_new_row_' + id;
            new_tr.id = row_id;
            var td_1 = document.createElement('td');
            var td_2 = document.createElement('td');
            var td_3 = document.createElement('td');

            td_1.className = 'sq-backend-table-cell';
            td_2.className = 'sq-backend-table-cell';
            td_3.className = 'sq-backend-table-cell';
            td_1.style.borderTop = '1px solid #19212A';
            td_2.style.borderTop = '1px solid #19212A';
            td_3.style.borderTop = '1px solid #19212A';
            td_1.innerHTML = '<b>Choose File</b>';
            td_2.innerHTML = '<input type="file" size="50" name="bulk_file_upload_file_chooser_' + id + '" id="bulk_file_upload_file_chooser_' + id + '" class="sq-form-field" onchange="local_file_table.fileSelected(this, \'' + id + '\');" />';
            td_3.innerHTML = '<img title="Delete News" src="http://ladoo.com.au/__data/asset_types/bodycopy/images/icons/delete.png" onclick="local_file_table.removeRow(\'' + id + '\', true);">';

            new_tr.appendChild(td_1);
            new_tr.appendChild(td_2);
            new_tr.appendChild(td_3);

            return new_tr;

        }//end _newRow()

        this.removeRow = function(id, removeFromList)
        {
            elt = document.getElementById('bulk_file_upload_file_chooser_' + id);
            if (elt.tagName.toLowerCase() == 'span') {
                file_name = document.getElementById('bulk_file_upload_file_chooser_' + id + '_').value;
            } else if (elt.tagName == 'input') {
                file_name = '';
            }

            children = this.tbody.childNodes;
            for (var i = 0; i < children.length; i++) {
                if (children[i].id == 'bulk_file_upload_new_row_' + id) {
                    type = this._currentFileType(id);
                    if (type == 'image') {
                        this.tbody.removeChild(children[i + 4]);
                        this.tbody.removeChild(children[i + 3]);
                        this.tbody.removeChild(children[i + 2]);
                        this.tbody.removeChild(children[i + 1]);
                    } else {
                        if (children[i + 1] != null) {
                            if (children[i + 1].id == 'bulk_file_upload_new_row_file_type_' + id) {
                                this.tbody.removeChild(children[i + 2]);
                                this.tbody.removeChild(children[i + 1]);
                            }
                        }
                    }
                    this.tbody.removeChild(children[i]);
                    break;
                }
            }

            // Remove the file name from the list
            if (removeFromList) {
                new_file_names = Array();
                for (i = 0; i < this.file_names.length; i++) {
                    if (file_name != this.file_names[i]) {
                        new_file_names.push(this.file_names[i]);
                    }
                }
                this.file_names = new_file_names;
            }

        }//end removeRow()

        // Set the type of the file as one of the specialised types, or file if none match
        this.fileSelected = function(elt, id)
        {
            // Replace input tag with span so that people can double select the file
            span = document.createElement('span');
            span.innerHTML = elt.value;
            span.id = elt.id;
            p_node = elt.parentNode;
            p_node.insertBefore(span, elt);
            elt.style.display = 'none';
            elt.id = elt.id + '_';

            // Duplication Checks.
            file_name = elt.value;
            for (i = 0; i < this.file_names.length; i++) {
                if (file_name == this.file_names[i]) {
                    alert('The file, ' + file_name + ' already has been added.');
                    this.removeRow(id, false);
                    return FALSE;
                }
            }
            this.file_names.push(file_name);

            row_id = 'bulk_file_upload_new_row_' + id;
            children = this.tbody.childNodes;
            for (var i = 0; i < children.length; i++) {
                if (children[i].id == row_id) {
                    extension = this._getFileType(file_name);
                    if (i == (children.length - 1)) {
                        // Last element, appendChild
                        this.tbody.appendChild(this._fileTypeRow(id, extension));
                        this.tbody.appendChild(this._newImageRow(id, 'Title'));
                        if (this._currentFileType(id) == 'image') {
                            this.tbody.appendChild(this._newImageRow(id, 'Alt'));
                            this.tbody.appendChild(this._newImageRow(id, 'Caption'));
                        }
                    } else {
                        // Somewhere in the middle, insertBefore
                        this.tbody.insertBefore(this._fileTypeRow(id, extension), children[i + 1]);
                        this.tbody.insertBefore(this._newImageRow(id, 'Title'), children[i + 2]);
                        if (this._currentFileType(id) == 'image') {
                            this.tbody.insertBefore(this._newImageRow(id, 'Alt'), children[i + 3]);
                            this.tbody.insertBefore(this._newImageRow(id, 'Caption'), children[i + 4]);
                        }
                    }
                    break;
                }
            }

        }//end fileSelected()

        this._fileTypeRow = function(id, ext)
        {
            new_tr = document.createElement('tr');
            new_tr.id = 'bulk_file_upload_new_row_file_type_' + id;
            td_1 = document.createElement('td');
            td_2 = document.createElement('td');


            td_1.className = 'sq-backend-table-cell';
            td_2.className = 'sq-backend-table-cell';
            td_1.innerHTML = 'File Type';

            // Detect the initial file type from the file extension
            if (this._isFileTypeIn(this.image_exts, ext)) {
                td_2.innerHTML = 'Image<input type="hidden" value="1" name="bulk_file_upload_row_' + id + '_file_type_image" id="bulk_file_upload_row_' + id + '_file_type_image" \>';
            } else if (this._isFileTypeIn(this.doc_exts, ext)) {
                td_2.innerHTML = 'MS Word<input type="hidden" value="1" name="bulk_file_upload_row_' + id + '_file_type_word" id="bulk_file_upload_row_' + id + '_file_type_word" \>';
            } else if (this._isFileTypeIn(this.pdf_exts, ext)) {
                td_2.innerHTML = 'PDF<input type="hidden" value="1" name="bulk_file_upload_row_' + id + '_file_type_pdf" id="bulk_file_upload_row_' + id + '_file_type_pdf" \>';
            } else if (this._isFileTypeIn(this.ppt_exts, ext)) {
                td_2.innerHTML = 'MS Powerpoint<input type="hidden" value="1" name="bulk_file_upload_row_' + id + '_file_type_powerpoint" id="bulk_file_upload_row_' + id + '_file_type_powerpoint" \>';
            } else if (this._isFileTypeIn(this.xls_exts, ext)) {
                td_2.innerHTML = 'MS Excel<input type="hidden" value="1" name="bulk_file_upload_row_' + id + '_file_type_excel" id="bulk_file_upload_row_' + id + '_file_type_excel" \>';
            } else if (this._isFileTypeIn(this.rtf_exts, ext)) {
                td_2.innerHTML = 'RTF<input type="hidden" value="1" name="bulk_file_upload_row_' + id + '_file_type_rtf" id="bulk_file_upload_row_' + id + '_file_type_rtf" \>';
            } else if (this._isFileTypeIn(this.txt_exts, ext)) {
                td_2.innerHTML = 'Text<input type="hidden" value="1" name="bulk_file_upload_row_' + id + '_file_type_text" id="bulk_file_upload_row_' + id + '_file_type_textf" \>';
            } else if (this._isFileTypeIn(this.css_exts, ext)) {
                td_2.innerHTML = 'CSS<input type="hidden" value="1" name="bulk_file_upload_row_' + id + '_file_type_css" id="bulk_file_upload_row_' + id + '_file_type_css" \>';
            } else if (this._isFileTypeIn(this.js_exts, ext)) {
                td_2.innerHTML = 'JS<input type="hidden" value="1" name="bulk_file_upload_row_' + id + '_file_type_js" id="bulk_file_upload_row_' + id + '_file_type_js" \>';
            } else if (this._isFileTypeIn(this.mp3_exts, ext)) {
                td_2.innerHTML = 'MP3<input type="hidden" value="1" name="bulk_file_upload_row_' + id + '_file_type_mp3" id="bulk_file_upload_row_' + id + '_file_type_mp3" \>';
            } else if (this._isFileTypeIn(this.video_exts, ext)) {
                td_2.innerHTML = 'Video<input type="hidden" value="1" name="bulk_file_upload_row_' + id + '_file_type_video" id="bulk_file_upload_row_' + id + '_file_type_video" \>';
            } else {
                td_2.innerHTML = 'Others<input type="hidden" value="1" name="bulk_file_upload_row_' + id + '_file_type_others" id="bulk_file_upload_row_' + id + '_file_type_others" \>';
            }

            td_2.colSpan = '2';
            new_tr.appendChild(td_1);
            new_tr.appendChild(td_2);

            return new_tr;

        }//end _fileTypeRow()

        this._isFileTypeIn = function(list, findme)
        {
            for (var i = 0; i < list.length; i++) {
                if (findme.toLowerCase() == list[i]) {
                    return true;
                }
            }
            return false;

        }//end _isFileTypeIn()

        this._getFileType = function(name)
        {
            if (name.indexOf('.') == -1) {
                return '';
            }
            var arr = name.split('.');
            extension = arr[arr.length - 1];
            return extension.toLowerCase();

        }//end _isImage()

        // Return the currently chosen file type name in String
        // (one of the specialised types, or 'others' for other file types)
        // It also returns 'none' if the file has been chosen
        this._currentFileType = function(id)
        {
            types = Array('image', 'pdf', 'word', 'powerpoint', 'excel', 'rtf', 'text', 'js' , 'css', 'mp3', 'video', 'others');
            for (i = 0; i < types.length; i++) {
                radio_button = document.getElementById('bulk_file_upload_row_' + id + '_file_type_' + types[i]);
                if (radio_button != null) {
                    if (radio_button.value == "1") {
                        return types[i];
                    }
                }
            }

        }//end _currentFileType()

        this._newImageRow = function(id, type)
        {
            var new_tr = document.createElement('tr');
            new_tr.id = 'bulk_file_upload_new_row_' + type.toLowerCase() + '_' + id;
            var td_1 = document.createElement('td');
            var td_2 = document.createElement('td');

            td_1.className = 'sq-backend-table-cell';
            td_2.className = 'sq-backend-table-cell';

            td_1.innerHTML = type;
            if (type == 'Caption') {
                td_2.innerHTML = '<textarea cols="60" rows="2" name="bulk_file_upload_new_row_' + type.toLowerCase() + '_msg_' + id + '" size="30" maxlength="255"></textarea>';
            } else {
                td_2.innerHTML = '<input type="text" name="bulk_file_upload_new_row_' + type.toLowerCase() + '_msg_' + id + '" size="30" maxlength="255" />';
            }
            td_2.colSpan = '2';

            new_tr.appendChild(td_1);
            new_tr.appendChild(td_2);

            return new_tr;

        }//end _newCaptionRow()

    }//end class local_file_import_table()
}

$(document).ready(function(){
    if ( (typeof(myMatrix) !== "undefined") && myMatrix.isCorrectFrame() ) {
        window.local_file_table = new local_file_import_table();
    }
});