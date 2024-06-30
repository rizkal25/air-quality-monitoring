// Fungsi untuk menampilkan tabel data kelembaban
function drawDataTable(data) {
    var tableBody = document.getElementById('humidity-table');
    tableBody.innerHTML = '';

    var validData = data.filter(rowData => !isNaN(parseFloat(rowData.field2)));
    for (var i = Math.max(0, validData.length - 10); i < validData.length; i++) {
        var rowData = validData[i];
        var row = tableBody.insertRow();
        var numberCell = row.insertCell();
        var timeCell = row.insertCell();
        var tempCell = row.insertCell();

        numberCell.textContent = i + 1;
        timeCell.textContent = new Date(rowData.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        tempCell.textContent = rowData.field2;
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
let humidityChart;
let maxHumidityChart;
let minHumidityChart;
let avgHumidityChart;
let humidityHistogram;

function showHumidityChart() {
    var url1 = "https://api.thingspeak.com/channels/2566396/feeds.json?api_key=AQ3SV4JV3Z6341SS";
    var url2 = "https://api.thingspeak.com/channels/2461739/feeds.json?api_key=Y7R0L1U8V9J1X6D3";

    Promise.all([
        fetch(url1).then(response => response.json()),
        fetch(url2).then(response => response.json())
    ])
    .then(results => {
        var data = results[0].feeds;
        var data1 = results[1].feeds;
        
        var validData = data.filter(entry => !isNaN(parseFloat(entry.field2)));
        var validData1 = data1.filter(entry => !isNaN(parseFloat(entry.field3)));
        
        drawHumidityChart(validData);
        drawHumidityHistogram(validData);
        drawDataTable(validData);

        // Perbarui indikator berdasarkan nilai terbaru dari validData2
        if (validData1.length > 0) {
            var latestValue = parseFloat(validData1[validData1.length - 1].field3);
            updateIconColor(latestValue);
        }
    })
    .catch(error => console.error('Error:', error));
}
// Fungsi untuk menggambar grafik kelembaban menggunakan Chart.js
function drawHumidityChart(data) {
    var labels = [];
    var humidities = [];

    data.forEach(entry => {
        var time = new Date(entry.created_at);
        labels.push(time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
        humidities.push(parseFloat(entry.field2)); // Adjust field2 for humidity data
    });

    var maxHumidity = Math.max(...humidities);
    var minHumidity = Math.min(...humidities);
    var avgHumidity = humidities.reduce((a, b) => a + b, 0) / humidities.length;

    var ctx = document.getElementById('humidity-chart').getContext('2d');
    if (humidityChart) {
        humidityChart.data.labels = labels;
        humidityChart.data.datasets[0].data = humidities;
        humidityChart.update();
    } else {
        humidityChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Kelembaban',
                    data: humidities,
                    borderColor: 'red',
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
                            labelString: 'Kelembaban (%)'
                        }
                    }]
                }
            }
        });
    }

    drawCircleChart('max-humidity-chart', maxHumidity, 'Max', maxHumidityChart);
    drawCircleChart('min-humidity-chart', minHumidity, 'Min', minHumidityChart);
    drawCircleChart('avg-humidity-chart', avgHumidity, 'Avg', avgHumidityChart);
}

// Fungsi untuk menggambar grafik lingkaran
function drawCircleChart(elementId, value, label, chartInstance) {
    var ctx = document.getElementById(elementId).getContext('2d');
    if (chartInstance) {
        chartInstance.data.datasets[0].data = [value, 100 - value];
        chartInstance.update();
    } else {
        chartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                datasets: [{
                    data: [value, 100 - value],
                    backgroundColor: [
                        'white',
                        'red',
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

    if (elementId === 'max-humidity-chart') {
        maxHumidityChart = chartInstance;
    } else if (elementId === 'min-humidity-chart') {
        minHumidityChart = chartInstance;
    } else if (elementId === 'avg-humidity-chart') {
        avgHumidityChart = chartInstance;
    }
}

// Fungsi untuk menggambar grafik batang (histogram)
function drawHumidityHistogram(data) {
    var ranges = {
        '20-30': 0,
        '31-40': 0,
        '41-50': 0,
        '51-60': 0,
        '61-70': 0,
        '71-80': 0,
        '81-90': 0,
        '91-100': 0
    };

    data.forEach(entry => {
        var value = parseFloat(entry.field2); // Adjust field2 for humidity data

        if (value >= 20 && value <= 30) ranges['20-30']++;
        else if (value >= 31 && value <= 40) ranges['31-40']++;
        else if (value >= 41 && value <= 50) ranges['41-50']++;
        else if (value >= 51 && value <= 60) ranges['51-60']++;
        else if (value >= 61 && value <= 70) ranges['61-70']++;
        else if (value >= 71 && value <= 80) ranges['71-80']++;
        else if (value >= 81 && value <= 90) ranges['81-90']++;
        else if (value >= 91 && value <= 100) ranges['91-100']++;
    });

    var ctx = document.getElementById('humidity-histogram').getContext('2d');
    if (humidityHistogram) {
        humidityHistogram.data.datasets[0].data = Object.values(ranges);
        humidityHistogram.update();
    } else {
        humidityHistogram = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Object.keys(ranges),
                datasets: [{
                    label: 'Kelembaban (%)',
                    data: Object.values(ranges),
                    backgroundColor: 'red',
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
                            labelString: 'Rentang Kelembaban (%)'
                        }
                    }],
                    yAxes: [{
                        scaleLabel: {
                            display: true,
                            labelString: 'Jumlah Pembacaan'
                        },
                        ticks: {
                            beginAtZero: true,
                            precision: 0
                        }
                    }]
                }
            }
        });
    }
}

// Memanggil fungsi untuk memperbarui data setiap 15 detik
setInterval(showHumidityChart, 10000);

// Panggil fungsi pertama kali saat halaman dimuat
showHumidityChart();
