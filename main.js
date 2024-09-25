window.addEventListener('load', function () {
    // The `initSqlJs` function is globally provided by all of the main dist files if loaded in the browser.
    // We must specify this locateFile function if we are loading a wasm file from anywhere other than the current html page's folder.
    let config = {
        locateFile: () => "lib/sqljs/dist/sql-wasm.wasm",
    };
    initSqlJs(config).then(function (SQL) {
        console.log("sql.js initialized 🎉");
        const uploadInput = document.getElementById('upload')
        const table = document.getElementById('result-body')

        uploadInput.onchange = function () {
            const file = uploadInput.files[0];
            const reader = new FileReader();
            reader.onload = function () {
                const Uints = new Uint8Array(reader.result);
                db = new SQL.Database(Uints);

                // Prepare a statement
                const stmt = db.prepare("SELECT Bookmark.DateCreated, content.BookTitle, content.Title, Bookmark.Text, Bookmark.Annotation FROM Bookmark LEFT JOIN content ON Bookmark.ContentID = content.ContentID");
                stmt.getAsObject({ $start: 1, $end: 1 }); // {col1:1, col2:111}

                // Bind new values
                stmt.bind({ $start: 1, $end: 2 });
                while (stmt.step()) {
                    const row = stmt.getAsObject();
                    let tableRow = document.createElement('tr');
                    let values = Object.values(row)
                    let t = values[0].split(/[- :T]/);
                    t = new Date(Date.UTC(t[0], t[1] - 1, t[2], t[3], t[4], t[5]));
                    values[0] = t.toLocaleDateString() + " " + t.toLocaleTimeString();

                    values.forEach(v => {
                        let td = document.createElement('td');
                        td.innerHTML = v;
                        tableRow.appendChild(td);
                    })
                    table.appendChild(tableRow)
                }

                new DataTable('#result-table');
            }
            reader.readAsArrayBuffer(file);
        }
    });
})