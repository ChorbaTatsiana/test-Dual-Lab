"use strict";

const ctx = document.getElementById("myChart").getContext("2d");
const RUB_CUR_ID = 298;
const USD_CUR_ID = 145;
const EUR_CUR_ID = 292;
let currency = RUB_CUR_ID;
let nameCurrency = 'RUB';
let colorDiagram = 'green';
let select = document.querySelector('select');

//calendar

let firstDate = new Date();
let secondDate = new Date(firstDate - 600000000);
let daysLag = Math.ceil(Math.abs(firstDate.getTime() - secondDate.getTime()) / (1000 * 3600 * 24));
let arrDay = [];
let formatDayFirst = 0;
let formatDaySecond = 0;

let calendar = new dhx.Calendar("calendar", {
    width: "400",
    weekStart: "monday",
    css: "dhx_widget--bordered",
    dateFormat: "%d-%m-%Y",
    range: true,
    value: [secondDate, firstDate]
});

calendar.events.on("change", function () {
    let dateRange = [];
    dateRange = calendar.getValue(true);
    if (dateRange.length > 1) {
        firstDate = dateRange[1];
        secondDate = dateRange[0];
        daysLag = Math.ceil(Math.abs(firstDate.getTime() - secondDate.getTime()) / (1000 * 3600 * 24));
        console.log(daysLag);
        setFormatDay(firstDate, secondDate);
        setArrayDays(daysLag);
        doJob();
    }
});

function setFormatDay(firstDate, secondDate) {
    formatDayFirst = firstDate.getFullYear() + '-' + (firstDate.getMonth() + 1) + '-' + firstDate.getDate();
    formatDaySecond = secondDate.getFullYear() + '-' + (secondDate.getMonth() + 1) + '-' + secondDate.getDate();
}

setFormatDay(firstDate, secondDate);

function setArrayDays(length) {
    arrDay = [];
    for (let i = 0; i <= length; i++) {
        let day = new Date(secondDate.getTime() + 24 * i * 3600 * 1000).toLocaleDateString();
        arrDay.push(day);
    }
}

setArrayDays(daysLag);

select.addEventListener('change', () => {
    let value = select.value;
    if (value == 2) {
        currency = USD_CUR_ID;
        nameCurrency = 'USD';
        colorDiagram = 'blue';
    }
    if (value == 3) {
        currency = EUR_CUR_ID;
        nameCurrency = 'EUR';
        colorDiagram = 'red';
    }
    doJob();
});

const getResourses = async url => {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`шибка по адресу ${url}, статут ошибки ${response}`);
    }
    return await response.json();
};

function courseVal(data, arr) {
    data.forEach(item => {
        for (let key in item) {
            if (key === "Cur_OfficialRate") {
                arr.push(item[key]);
            }
        }
    });
}

async function doJob() {

    const dataCurrency = await getResourses(
        `https://www.nbrb.by/API/ExRates/Rates/Dynamics/${currency}?startDate=${formatDaySecond}&endDate=${formatDayFirst}`
    );

    const courseCurrency = [];
    courseVal(dataCurrency, courseCurrency);

    const myChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: arrDay,
            datasets: [
                {
                    label: `${nameCurrency}`,
                    data: courseCurrency,
                    backgroundColor: "transparent",
                    borderColor: `${colorDiagram}`,
                    borderWidth: 2
                },
            ]
        },
        options: {
            scales: {
                yAxes: [
                    {
                        ticks: {
                            beginAtZero: false
                        }
                    }
                ]
            }
        }
    });
}

doJob();
