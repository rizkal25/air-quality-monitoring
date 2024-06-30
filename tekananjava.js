// Fungsi untuk menampilkan tabel data suhu
function drawDataTable(data) {
    var tableBody = document.getElementById('pressure-table');
    tableBody.innerHTML = '';

    var validData = data.filter(rowData => !isNaN(parseFloat(rowData.field3)));
    for (var i = Math.max(0, validData.length - 10); i < validData.length; i++) {
        var rowData = validData[i];
        var row = tableBody.insertRow();
        var numberCell = row.insertCell();
        var timeCell = row.insertCell();
        var tempCell = row.insertCell();

        numberCell.textContent = i + 1;
        timeCell.textContent = new Date(rowData.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        tempCell.textContent = rowData.field3;
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

let pressureChart;
let maxPressureChart;
let minPressureChart;
let avgPressureChart;
let pressureHistogram;

function showPressureChart() {
    var url1 = "https://api.thingspeak.com/channels/2566396/feeds.json?api_key=AQ3SV4JV3Z6341SS";
    var url2 = "https://api.thingspeak.com/channels/2461739/feeds.json?api_key=Y7R0L1U8V9J1X6D3";

    Promise.all([
        fetch(url1).then(response => response.json()),
        fetch(url2).then(response => response.json())
    ])
    .then(results => {
        var data = results[0].feeds;
        var data1 = results[1].feeds;
        
        var validData = data.filter(entry => !isNaN(parseFloat(entry.field3)));
        var validData1 = data1.filter(entry => !isNaN(parseFloat(entry.field3)));
        
        drawPressureChart(validData);
        drawPressureHistogram(validData);
        drawDataTable(validData);

        // Perbarui indikator berdasarkan nilai terbaru dari validData2
        if (validData1.length > 0) {
            var latestValue = parseFloat(validData1[validData1.length - 1].field3);
            updateIconColor(latestValue);
        }
    })
    .catch(error => console.error('Error:', error));
}

// Fungsi untuk menggambar grafik tekanan udara menggunakan Chart.js
function drawPressureChart(data) {
    var labels = [];
    var pressures = [];

    data.forEach(entry => {
        var time = new Date(entry.created_at);
        labels.push(time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
        pressures.push(parseFloat(entry.field3)); // Adjust field3 for pressure data
    });

    var maxPressure = Math.max(...pressures);
    var minPressure = Math.min(...pressures);
    var avgPressure = pressures.reduce((a, b) => a + b, 0) / pressures.length;

    var ctx = document.getElementById('pressure-chart').getContext('2d');
    if (pressureChart) {
        pressureChart.data.labels = labels;
        pressureChart.data.datasets[0].data = pressures;
        pressureChart.update();
    } else {
        pressureChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Tekanan Udara',
                    data: pressures,
                    borderColor: 'green',
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
                            labelString: 'Tekanan Udara (hPa)'
                        }
                    }]
                }
            }
        });
    }

    drawCircleChart('max-pressure-chart', maxPressure, 'Max', maxPressureChart);
    drawCircleChart('min-pressure-chart', minPressure, 'Min', minPressureChart);
    drawCircleChart('avg-pressure-chart', avgPressure, 'Avg', avgPressureChart);
}

// Fungsi untuk menggambar grafik lingkaran
function drawCircleChart(elementId, value, label, chartInstance) {
    var ctx = document.getElementById(elementId).getContext('2d');
    if (chartInstance) {
        chartInstance.data.datasets[0].data = [value, 1030 - value];
        chartInstance.update();
    } else {
        chartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                datasets: [{
                    data: [value, 1030 - value],
                    backgroundColor: [
                        'white',
                        'green',
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

    if (elementId === 'max-pressure-chart') {
        maxPressureChart = chartInstance;
    } else if (elementId === 'min-pressure-chart') {
        minPressureChart = chartInstance;
    } else if (elementId === 'avg-pressure-chart') {
        avgPressureChart = chartInstance;
    }
}

// Fungsi untuk menggambar grafik batang (histogram)
function drawPressureHistogram(data) {
    var ranges = {
        '900-960': 0,
        '961-970': 0,
        '971-980': 0,
        '981-990': 0,
        '991-1000': 0,
        '1001-1010': 0,
        '1011-1020': 0,
        '1021-1030': 0
    };

    data.forEach(entry => {
        var value = parseFloat(entry.field3); // Adjust field3 for pressure data

        if (value >= 900 && value <= 960) ranges['900-960']++;
        else if (value >= 961 && value <= 970) ranges['961-970']++;
        else if (value >= 971 && value <= 980) ranges['971-980']++;
        else if (value >= 981 && value <= 990) ranges['981-990']++;
        else if (value >= 991 && value <= 1000) ranges['991-1000']++;
        else if (value >= 1001 && value <= 1010) ranges['1001-1010']++;
        else if (value >= 1011 && value <= 1020) ranges['1011-1020']++;
        else if (value >= 1021 && value <= 1030) ranges['1021-1030']++;
    });

    var ctx = document.getElementById('pressure-histogram').getContext('2d');
    if (pressureHistogram) {
        pressureHistogram.data.datasets[0].data = Object.values(ranges);
        pressureHistogram.update();
    } else {
        pressureHistogram = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Object.keys(ranges),
                datasets: [{
                    label: 'Tekanan Udara (hPa)',
                    data: Object.values(ranges),
                    backgroundColor: 'green',
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
                            labelString: 'Rentang Tekanan (hPa)'
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
setInterval(showPressureChart, 10000);

// Panggil fungsi pertama kali saat halaman dimuat
showPressureChart();
