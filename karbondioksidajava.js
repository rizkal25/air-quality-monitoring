// Fungsi untuk menampilkan tabel data CO₂
function drawDataTable(data) {
    var tableBody = document.getElementById('co2-table');
    tableBody.innerHTML = '';

    var validData = data.filter(rowData => !isNaN(parseFloat(rowData.field1)));
    for (var i = Math.max(0, validData.length - 10); i < validData.length; i++) {
        var rowData = validData[i];
        var row = tableBody.insertRow();
        var numberCell = row.insertCell();
        var timeCell = row.insertCell();
        var co2Cell = row.insertCell();

        numberCell.textContent = i + 1;
        timeCell.textContent = new Date(rowData.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        co2Cell.textContent = rowData.field5;
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
let co2Chart;
let maxCO2Chart;
let minCO2Chart;
let avgCO2Chart;
let co2Histogram;

function showCO2Chart() {
    var url1 = "https://api.thingspeak.com/channels/2566396/feeds.json?api_key=AQ3SV4JV3Z6341SS";
    var url2 = "https://api.thingspeak.com/channels/2461739/feeds.json?api_key=Y7R0L1U8V9J1X6D3";

    Promise.all([
        fetch(url1).then(response => response.json()),
        fetch(url2).then(response => response.json())
    ])
    .then(results => {
        var data = results[0].feeds;
        var data1 = results[1].feeds;
        
        var validData = data.filter(entry => !isNaN(parseFloat(entry.field5)));
        var validData1 = data1.filter(entry => !isNaN(parseFloat(entry.field3)));
        
        drawCO2Chart(validData);
        drawCO2Histogram(validData);
        drawDataTable(validData);

        // Perbarui indikator berdasarkan nilai terbaru dari validData2
        if (validData1.length > 0) {
            var latestValue = parseFloat(validData1[validData1.length - 1].field3);
            updateIconColor(latestValue);
        }
    })
    .catch(error => console.error('Error:', error));
}
// Fungsi untuk menggambar grafik CO₂ menggunakan Chart.js
function drawCO2Chart(data) {
    var labels = [];
    var co2Levels = [];

    data.forEach(entry => {
        var time = new Date(entry.created_at);
        labels.push(time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
        co2Levels.push(parseFloat(entry.field5));
    });

    var maxCO2 = Math.max(...co2Levels);
    var minCO2 = Math.min(...co2Levels);
    var avgCO2 = co2Levels.reduce((a, b) => a + b, 0) / co2Levels.length;

    var ctx = document.getElementById('co2-chart').getContext('2d');
    if (co2Chart) {
        co2Chart.data.labels = labels;
        co2Chart.data.datasets[0].data = co2Levels;
        co2Chart.update();
    } else {
        co2Chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Kadar CO₂',
                    data: co2Levels,
                    borderColor: 'orange',
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
                            labelString: 'Kadar CO₂ (ppm)'
                        }
                    }]
                }
            }
        });
    }

    drawCircleChart('max-co2-chart', maxCO2, 'Max', maxCO2Chart);
    drawCircleChart('min-co2-chart', minCO2, 'Min', minCO2Chart);
    drawCircleChart('avg-co2-chart', avgCO2, 'Avg', avgCO2Chart);
}

// Fungsi untuk menggambar grafik lingkaran
function drawCircleChart(elementId, value, label, chartInstance) {
    var ctx = document.getElementById(elementId).getContext('2d');
    if (chartInstance) {
        chartInstance.data.datasets[0].data = [value, 2000 - value];
        chartInstance.update();
    } else {
        chartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                datasets: [{
                    data: [value, 2000 - value],
                    backgroundColor: [
                        'white',
                        'orange',
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

    if (elementId === 'max-co2-chart') {
        maxCO2Chart = chartInstance;
    } else if (elementId === 'min-co2-chart') {
        minCO2Chart = chartInstance;
    } else if (elementId === 'avg-co2-chart') {
        avgCO2Chart = chartInstance;
    }
}

// Fungsi untuk menggambar grafik batang (histogram)
function drawCO2Histogram(data) {
    var ranges = {
        '300-400': 0,
        '401-500': 0,
        '501-600': 0,
        '601-700': 0,
        '701-800': 0,
        '801-900': 0,
        '901-1000': 0,
        '1001-2000': 0
    };

    data.forEach(entry => {
        var value = parseFloat(entry.field5);

        if (value >= 300 && value <= 400) ranges['300-400']++;
        else if (value >= 401 && value <= 500) ranges['401-500']++;
        else if (value >= 501 && value <= 600) ranges['501-600']++;
        else if (value >= 601 && value <= 700) ranges['601-700']++;
        else if (value >= 701 && value <= 800) ranges['701-800']++;
        else if (value >= 801 && value <= 900) ranges['801-900']++;
        else if (value >= 901 && value <= 1000) ranges['901-1000']++;
        else if (value >= 1001 && value <= 2000) ranges['1001-2000']++;
    });

    var ctx = document.getElementById('co2-histogram').getContext('2d');
    if (co2Histogram) {
        co2Histogram.data.datasets[0].data = Object.values(ranges);
        co2Histogram.update();
    } else {
        co2Histogram = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Object.keys(ranges),
                datasets: [{
                    label: 'Kadar CO₂ (ppm)',
                    data: Object.values(ranges),
                    backgroundColor: 'orange',
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
                            labelString: 'Rentang Kadar CO₂ (ppm)'
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
setInterval(showCO2Chart, 10000);

// Panggil fungsi pertama kali saat halaman dimuat
showCO2Chart();
