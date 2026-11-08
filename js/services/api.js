// ===== DATA SERVICE: MEMBACA FILE JSON DAN FILE TEMPLATE =====
// Semua akses file dikumpulkan di sini sehingga komponen cukup menerima data jadi lewat props.
// Karena memakai fetch, aplikasi wajib dibuka lewat server lokal (http://localhost), bukan
// dengan klik dua kali index.html (file://), sebab browser memblokir fetch dari file://.

var Api = (function () {
    var DATA_URL = "data/dataBahanAjar.json";

    // Satu file per komponen di folder templates/, masing-masing berisi <template id="tpl-...">.
    var TEMPLATE_FILES = [
        "status-badge",
        "app-modal",
        "stock-form",
        "stock-table",
        "do-tracking",
        "order-form"
    ];

    function ambil(url) {
        return fetch(url).then(function (response) {
            if (!response.ok) {
                throw new Error("Gagal memuat " + url + " (HTTP " + response.status + ").");
            }

            return response.text();
        });
    }

    // Di JSON, tracking berupa array berisi object ber-key nomor DO, dan DO2025-0001 tercatat dua
    // kali. Data diratakan menjadi satu object { nomorDO: dataDO } sehingga duplikat tergabung dan
    // DO dapat dicari langsung lewat nomornya.
    function normalisasiTracking(trackingList) {
        var hasil = {};

        trackingList.forEach(function (entri) {
            Object.keys(entri).forEach(function (nomor) {
                if (!hasil[nomor]) {
                    hasil[nomor] = entri[nomor];
                }
            });
        });

        return hasil;
    }

    function loadData() {
        return ambil(DATA_URL).then(function (teks) {
            var data = JSON.parse(teks);

            data.tracking = normalisasiTracking(data.tracking);

            return data;
        });
    }

    // Template disisipkan ke <body> sebelum komponen dirender, karena komponen memakai
    // template: "#tpl-..." yang dicari Vue di dokumen saat komponen pertama kali ditampilkan.
    function loadTemplates() {
        var permintaan = TEMPLATE_FILES.map(function (nama) {
            return ambil("templates/" + nama + ".html");
        });

        return Promise.all(permintaan).then(function (daftarHtml) {
            var wadah = document.createElement("div");

            wadah.id = "templates";
            wadah.hidden = true;
            wadah.innerHTML = daftarHtml.join("\n");

            document.body.appendChild(wadah);
        });
    }

    return {
        loadData: loadData,
        loadTemplates: loadTemplates
    };
})();
