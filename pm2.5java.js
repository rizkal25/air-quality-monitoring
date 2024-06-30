// Fungsi untuk menampilkan tabel data PM2.5
function drawDataTable(data) {
    var tableBody = document.getElementById('pm25-table');
    tableBody.innerHTML = '';

    var validData = data.filter(rowData => !isNaN(parseFloat(rowData.field6)));
    for (var i = Math.max(0, validData.length - 10); i < validData.length; i++) {
        var rowData = validData[i];
        var row = tableBody.insertRow();
        var numberCell = row.insertCell();
        var timeCell = row.insertCell();
        var pm25Cell = row.insertCell();

        numberCell.textContent = i + 1;
        timeCell.textContent = new Date(rowData.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        pm25Cell.textContent = rowData.field6;
    }
}
function updateIconColor(value) {
    var icon1 = document.getElementById("person-icon-1");
    var icon2 = document.getElementById("person-icon-2");
    var icon3 = document.getElementById("person-icon-3");

    var text1 = document.getElementById("prediction-text-1");
    var text2 = document.getElementById("prediction-text-2");
    var text3 = document.getElementById("prediction-text-3");

     // Hapus semua kelas warna dan kedap-kedip
     [icon1, icon2, icon3].forEach(icon => {
        icon.classList.remove("green", "yellow","red", "flashing");
    });

    // Set semua teks prediksi ke string kosong
    [text1, text2, text3].forEach(text => {
        text.textContent = '';
    });

    if (value === 1) {
        icon1.classList.add("green", "flashing"); // Setel ikon 1 menjadi biru
        icon2.classList.add("green","flashing"); // Setel ikon 2 menjadi hijau
        icon3.classList.add("green","flashing"); // Setel ikon 3 menjadi hijau
        text1.textContent = 'Predt 1';

    } else if (value === 2) {
        icon1.classList.add("yellow", "flashing"); // Setel ikon 1 menjadi biru
        icon2.classList.add("yellow", "flashing"); // Setel ikon 2 menjadi biru
        icon3.classList.add("yellow", "flashing"); // Setel ikon 3 menjadi hijau
        text2.textContent = 'Predt 2';
    } else if (value === 3) {
        icon1.classList.add("red", "flashing"); // Setel ikon 1 menjadi biru
        icon2.classList.add("red", "flashing"); // Setel ikon 2 menjadi biru
        icon3.classList.add("red", "flashing"); // Setel ikon 3 menjadi biru
        text3.textContent = 'Predt 3';
    }
}


// Simpan referensi ke instance grafik agar dapat diperbarui
let pm25Chart;
let maxPM25Chart;
let minPM25Chart;
let avgPM25Chart;
let pm25Histogram;

function showPM25Chart() {
    var url1 = "https://api.thingspeak.com/channels/2566396/feeds.json?api_key=AQ3SV4JV3Z6341SS";
    var url2 = "https://api.thingspeak.com/channels/2461739/feeds.json?api_key=Y7R0L1U8V9J1X6D3";

    Promise.all([
        fetch(url1).then(response => response.json()),
        fetch(url2).then(response => response.json())
    ])
    .then(results => {
        var data = results[0].feeds;
        var data1 = results[1].feeds;
        
        var validData = data.filter(entry => !isNaN(parseFloat(entry.field6)));
        var validData1 = data1.filter(entry => !isNaN(parseFloat(entry.field3)));
        
        drawPM25Chart(validData);
        drawPM25Histogram(validData);
        drawDataTable(validData);

        // Perbarui indikator berdasarkan nilai terbaru dari validData2
        if (validData1.length > 0) {
            var latestValue = parseFloat(validData1[validData1.length - 1].field3);
            updateIconColor(latestValue);
        }
    })
    .catch(error => console.error('Error:', error));
}
// Fungsi untuk menggambar grafik PM2.5 menggunakan Chart.js
function drawPM25Chart(data) {
    var labels = [];
    var pm25Levels = [];

    data.forEach(entry => {
        var time = new Date(entry.created_at);
        labels.push(time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
        pm25Levels.push(parseFloat(entry.field6));
    });

    var maxPM25 = Math.max(...pm25Levels);
    var minPM25 = Math.min(...pm25Levels);
    var avgPM25 = pm25Levels.reduce((a, b) => a + b, 0) / pm25Levels.length;

    var ctx = document.getElementById('pm25-chart').getContext('2d');
    if (pm25Chart) {
        pm25Chart.data.labels = labels;
        pm25Chart.data.datasets[0].data = pm25Levels;
        pm25Chart.update();
    } else {
        pm25Chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Kadar PM2.5',
                    data: pm25Levels,
                    borderColor: 'rgb(189, 232, 0)',
                    borderWidth: 2,
                    fill: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    xAxes: [{
                        type: 'time',
                        time: {
                            unit: 'minute',
                            displayFormats: {
                                minute: 'H:mm'
                            }
                        },
                        scaleLabel: {
                            display: true,
                            labelString: 'Waktu'
                        }
                    }],
                    yAxes: [{
                        scaleLabel: {
                            display: true,
                            labelString: 'Kadar PM2.5 (ug/m³)'
                        }
                    }]
                }
            }
        });
    }

    drawCircleChart('max-pm25-chart', maxPM25, 'Max', maxPM25Chart);
    drawCircleChart('min-pm25-chart', minPM25, 'Min', minPM25Chart);
    drawCircleChart('avg-pm25-chart', avgPM25, 'Avg', avgPM25Chart);
}

// Fungsi untuk menggambar grafik lingkaran
function drawCircleChart(elementId, value, label, chartInstance) {
    var ctx = document.getElementById(elementId).getContext('2d');
    if (chartInstance) {
        chartInstance.data.datasets[0].data = [value, 400 - value];
        chartInstance.update();
    } else {
        chartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                datasets: [{
                    data: [value, 400 - value],
                    backgroundColor: [
                        'white',
                        'rgb(189, 232, 0)',
                    ]
                }],
                labels: [label, '']
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                legend: {
                    display: false
                }
            }
        });
    }

    var dataValueElement = document.getElementById(elementId.replace('-chart', '-data-value'));
    dataValueElement.innerText = value.toFixed(2);

    if (elementId === 'max-pm25-chart') {
        maxPM25Chart = chartInstance;
    } else if (elementId === 'min-pm25-chart') {
        minPM25Chart = chartInstance;
    } else if (elementId === 'avg-pm25-chart') {
        avgPM25Chart = chartInstance;
    }
}

function drawPM25Histogram(data) {
    var ranges = {
        '0-30': 0,
        '31-60': 0,
        '61-100': 0,
        '101-200': 0,
        '201-250': 0,
        '251-300': 0,
        '301-350': 0,
        '351-400': 0
    };

    data.forEach(entry => {
        var value = parseFloat(entry.field1);
        if (value >= 0 && value <= 50) ranges['0-30']++;
        else if (value >= 31 && value <= 60) ranges['31-60']++;
        else if (value >= 61 && value <= 100) ranges['61-100']++;
        else if (value >= 101 && value <= 200) ranges['101-200']++;
        else if (value >= 201 && value <= 250) ranges['201-250']++;
        else if (value >= 251 && value <= 300) ranges['251-300']++;
        else if (value >= 301 && value <= 350) ranges['301-350']++;
        else if (value >= 351 && value <= 400) ranges['351-400']++;
    });

    var ctx = document.getElementById('pm25-histogram').getContext('2d');
    if (pm25Histogram) {
        pm25Histogram.data.datasets[0].data = Object.values(ranges);
        pm25Histogram.update();
    } else {
        pm25Histogram = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Object.keys(ranges),
                datasets: [{
                    label: 'Kadar PM2.5 (ug/m³)',
                    data: Object.values(ranges),
                    backgroundColor: 'rgb(189, 232, 0)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    xAxes: [{
                        scaleLabel: {
                            display: true,
                            labelString: 'Rentang Kadar PM2.5 (ug/m³)'
                        }
                    }],
                    yAxes: [{
                        scaleLabel: {
                            display: true,
                            labelString: 'Jumlah Pembacaan'
                        },
                        ticks: {
                            beginAtZero: true,
                            precision: 0 // Menampilkan angka bulat pada sumbu y
                        }
                    }]
                }
            }
        });
    }
}

// Memanggil fungsi untuk memperbarui data setiap 15 detik
setInterval(showPM25Chart, 10000);

// Panggil fungsi pertama kali saat halaman dimuat
showPM25Chart();
