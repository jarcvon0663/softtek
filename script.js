function formatNumber(number) {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function formatInputValue(input) {
  var value = input.value.replace(/\./g, "").replace(/,/g, ".");
  input.value = formatNumber(value);
}

function getWeekdayHolidays(year) {
  const holidays = [
    "2025-01-01", "2025-01-06", "2025-03-24", "2025-04-17", "2025-04-18", "2025-05-01", "2025-06-02",
    "2025-06-23", "2025-06-30", "2025-07-20", "2025-08-07", "2025-08-18", "2025-10-13",
    "2025-11-03", "2025-11-17", "2025-12-08", "2025-12-25"
  ];

  // Ajustar las fechas para que se interpreten en la zona horaria local
  return holidays.map(date => {
    const [year, month, day] = date.split('-').map(Number);
    return new Date(year, month - 1, day); // Usar el constructor de Date con año, mes y día
  }).filter(date => date.getDay() >= 1 && date.getDay() <= 5); // Filtrar lunes a viernes
}

function calculateNightSurcharge(salary, startTime, endTime) {
  // Definir el rango nocturno como un array de horas
  const nightHours = [21, 22, 23, 0, 1, 2, 3, 4, 5, 6];

  // Convertir las horas de inicio y fin a números enteros (horas)
  const startHour = parseInt(startTime.split(":")[0]);
  const endHour = parseInt(endTime.split(":")[0]);

  let nightHoursCount = 0;

  if (startHour <= endHour) {
    // Caso normal: el turno no cruza la medianoche
    for (let hour = startHour; hour < endHour; hour++) {
      if (nightHours.includes(hour)) {
        nightHoursCount++;
      }
    }
  } else {
    // Caso especial: el turno cruza la medianoche
    // Primera parte: desde la hora de inicio hasta la medianoche
    for (let hour = startHour; hour <= 23; hour++) {
      if (nightHours.includes(hour)) {
        nightHoursCount++;
      }
    }
    // Segunda parte: desde la medianoche hasta la hora de salida
    for (let hour = 0; hour < endHour; hour++) {
      if (nightHours.includes(hour)) {
        nightHoursCount++;
      }
    }
  }

  console.log("Horas nocturnas:", nightHoursCount);

  // Calcular el valor de la hora ordinaria
  const hourlyWage = salary / 230;

  // Calcular el recargo nocturno (35% del valor de la hora por cada hora nocturna)
  const nightSurchargePerHour = hourlyWage * 0.35;
  const totalNightSurcharge = (nightHoursCount * nightSurchargePerHour) * 20; // Multiplicar por 20 días laborales

  console.log("Recargo nocturno:", totalNightSurcharge);

  // Retornar el recargo nocturno total
  return totalNightSurcharge;
}

// Función auxiliar para convertir tiempo (HH:mm) a minutos desde medianoche
function convertTimeToMinutes(time) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function calculateHolidaySurcharge(salary) {
  const hoursPerMonth = 230; // Horas laborales promedio por mes
  const weekdayHolidays = getWeekdayHolidays(2025); // Festivos entre semana en 2025
  console.log("Festivos entre semana:", weekdayHolidays);

  const hourlyWage = Math.trunc(salary / hoursPerMonth); // Valor de la hora ordinaria
  console.log(`Valor de la hora ordinaria: $${formatNumber(hourlyWage)}`);

  // Verificar si el checkbox "Compensado" está activado
  const compensadosCheckbox = document.getElementById("compensados");
  const surchargeRate = compensadosCheckbox.checked ? 0.75 : 1.75; // 0.75 si está compensado, 1.75 si no lo está

  // Calcular el costo adicional por trabajar en festivo
  const holidaySurchargePerDay = (hourlyWage * 8) * surchargeRate; // Costo por día festivo trabajado
  const totalHolidaySurcharge = weekdayHolidays.length * holidaySurchargePerDay;

  // Promediar el costo mensualmente
  const monthlySurcharge = totalHolidaySurcharge / 12;

  console.log("Recargo por festivos:", monthlySurcharge);

  // Redondear el resultado para evitar decimales
  return Math.round(monthlySurcharge);
}

function calculateCost() {
  // Obtener los valores de entrada
  var salaryInput = document.getElementById("salary");
  var bonusesInput = document.getElementById("bonuses");
  var subcontractorInput = document.getElementById("subcontractor");
  var salary = parseFloat(salaryInput.value.replace(/\./g, ""));
  var bonuses = parseFloat(bonusesInput.value.replace(/\./g, "")) || 0;
  var isSubcontractor = document.getElementById("toggle-contrato").checked;
  // Verificar si el checkbox de festivos está marcado
  const isHolidayChecked = document.getElementById("festivos").checked;

  // Otros checkboxes y variables
  var connectivityBonus = document.getElementById("connectivity-bonus").checked;
  var suraPolicy = document.getElementById("sura-policy").checked;
  var sanitas = document.getElementById("sanitas").checked;
  var lifeInsurance = document.getElementById("life-insurance").checked;
  var result = document.getElementById("result");
  var smmlv = 1423500; // Salario mínimo
  var transportAllowance = 200000; // Auxilio de transporte

  // Obtener la franja horaria
  const startTime = document.getElementById("start-time").value;
  const endTime = document.getElementById("end-time").value;

  if (!startTime || !endTime) {
    alert("Por favor, ingresa la hora de inicio y la hora de salida.");
    return;
  }

  // Inicializar el costo base
  var cost = 0;

  if (isSubcontractor) {
    // Si es Subcontractor, el costo es el valor ingresado en el input de subcontractor
    cost = parseFloat(subcontractorInput.value.replace(/\./g, ""));
  } else {
    // Calcular los recargos antes de aplicar las reglas de cálculo
    const holidaySurcharge = isHolidayChecked ? calculateHolidaySurcharge(salary) : 0;
    const nightSurcharge = calculateNightSurcharge(salary, startTime, endTime);

    // Sumar los recargos al salario base
    const totalSalaryWithSurcharges = salary + holidaySurcharge + nightSurcharge;

    // Aplicar las reglas de cálculo con el salario ajustado
    var integral = document.getElementById("integral").checked;
    if (integral && totalSalaryWithSurcharges <= 18505499) {
      result.innerHTML =
        "El salario debe ser superior a $18.505.499 para el régimen integral.";
      return;
    }
    var maxBonuses = totalSalaryWithSurcharges * 0.4;
    if (bonuses > maxBonuses) {
      result.innerHTML =
        "Los auxilios no pueden superar el 40% del salario prestacional, es decir: " +
        formatNumber(maxBonuses);
      return;
    }
    if (integral) {
      cost = Math.ceil(totalSalaryWithSurcharges * 1.27135 + bonuses);
    } else if (totalSalaryWithSurcharges < 2 * smmlv) {
      cost = Math.ceil(totalSalaryWithSurcharges * 1.40308 + transportAllowance + 45000 + bonuses);
    } else if (totalSalaryWithSurcharges + bonuses < 10 * smmlv) {
      cost = Math.ceil(totalSalaryWithSurcharges * 1.40308 + bonuses);
    } else {
      cost = Math.ceil(totalSalaryWithSurcharges * 1.53808 + bonuses);
    }

    // Sumar otros beneficios adicionales
    if (connectivityBonus) cost += 72000;
    if (suraPolicy) cost += 339291;
    if (sanitas) cost += 316400;
    if (lifeInsurance) cost += 24111;

    console.log("Recargo por festivos:", holidaySurcharge);
    console.log("Recargo nocturno:", nightSurcharge);
  }

  // Leer el archivo at.json
  fetch("at.json") // Cargar el archivo JSON
    .then((response) => response.json()) // Convertir la respuesta a JSON
    .then((atData) => {
      // Obtener los ATs para el departamento seleccionado
      var departmentSelect = document.getElementById("department");
      var selectedDepartment = departmentSelect.value;
      var departmentATs = atData[selectedDepartment];
      if (departmentATs && departmentATs.length > 0) {
        var nextAT = null;
        for (var i = 0; i < departmentATs.length; i++) {
          if (departmentATs[i].value > cost) {
            nextAT = departmentATs[i].code;
            break;
          }
        }
        if (nextAT) {
          fetch("https://www.datos.gov.co/resource/32sa-8pi3.json")
            .then((response) => response.json())
            .then((data) => {
              var exchangeRate = parseFloat(data[0].valor); // Obtener la tasa de cambio actual
              // Encontrar el valor asociado al código de AT encontrado
              var atValue = departmentATs.find((at) => at.code === nextAT).value;
              var costInUSD = (atValue / exchangeRate).toFixed(2); // Calcular en dólares usando el valor del AT
              // Obtener la fecha de hoy y formatearla como "20/ene/2025"
              var today = new Date();
              var day = today.getDate();
              var month = today
                .toLocaleString("es-CO", { month: "short" })
                .replace(".", ""); // Quitar el punto del mes abreviado
              var year = today.getFullYear();
              var formattedDate = `${day}/${month}/${year}`;
              let nightSurcharge = calculateNightSurcharge(salary, startTime, endTime);
              let holidaySurcharge = isHolidayChecked ? calculateHolidaySurcharge(salary) : 0;
              result.innerHTML = `El costo total del empleado es: $${formatNumber(
                cost
              )}. <br> <br>
                                AT para ${selectedDepartment}: ${nextAT}. / USD $${costInUSD} (USD Calculado con la tasa de cambio del ${formattedDate}).
                                <br> <br> Recargo nocturno mensual $${formatNumber(Math.trunc(nightSurcharge))}
                                <br> <br> Recargo festivo mensual $${formatNumber(Math.trunc(holidaySurcharge))}`;
            })
            .catch((error) => {
              console.error("Error al obtener la tasa de cambio:", error);
              result.innerHTML = `El costo total del empleado es: $${formatNumber(
                cost
              )}. <br> <br>
                             AT para ${selectedDepartment}: ${nextAT}. No se pudo calcular el equivalente en dólares.
                             <br> <br> Recargo nocturno mensual $${formatNumber(Math.trunc(nightSurcharge))}
                                <br> <br> Recargo festivo mensual $${formatNumber(Math.trunc(holidaySurcharge))}`;
            });
        } else {
          result.innerHTML = `El costo total del empleado es: $${formatNumber(
            cost
          )}. No se encontró un AT adecuado para la práctica ${selectedDepartment}.
          <br> <br> Recargo nocturno mensual $${formatNumber(Math.trunc(nightSurcharge))}
                                <br> <br> Recargo festivo mensual $${formatNumber(Math.trunc(holidaySurcharge))}`;
        }
        var formattedCost = formatNumber(cost).replace(/\./g, "");
        document.getElementById("amount").value = formattedCost;
      }
    })
    .catch((error) => {
      console.error("Error al cargar el archivo at.json:", error);
      result.innerHTML = "No se pudo cargar la información de los AT. Por favor, verifica el archivo at.json.";
    });
}

// Función para convertir moneda
async function convertCurrency() {
  const amountInput = document.getElementById("amount");
  const fromCurrencySelect = document.getElementById("fromCurrency");
  const toCurrencySelect = document.getElementById("toCurrency");
  const dateInput = document.getElementById("conversionDate");
  const resultDiv = document.getElementById("conversionResult");
  const amount = parseFloat(amountInput.value);
  const fromCurrency = fromCurrencySelect.value;
  const toCurrency = toCurrencySelect.value;
  const selectedDate = dateInput.value; // Formato: YYYY-MM-DD

  if (isNaN(amount) || amount <= 0) {
    resultDiv.innerHTML = "Por favor, ingrese un monto válido.";
    return;
  }

  if (fromCurrency === toCurrency) {
    resultDiv.innerHTML = `1 ${fromCurrency} equivale a 1 ${toCurrency}. No se requiere conversión.`;
    return;
  }

  try {
    let trm;

    // Si se selecciona una fecha, obtenemos la TRM de esa fecha usando la nueva API
    if (selectedDate) {
      const apiUrl = `https://trm-colombia.vercel.app/?date=${selectedDate}`;
      const response = await fetch(apiUrl);
      if (!response.ok)
        throw new Error("Error al obtener la TRM de la fecha seleccionada.");
      const data = await response.json();
      if (!data.data || !data.data.success)
        throw new Error("No se encontró la TRM para esta fecha.");
      trm = data.data.value;
    } else {
      // Si no se selecciona una fecha, obtenemos la TRM más reciente usando la otra API
      const apiUrl = "https://www.datos.gov.co/resource/32sa-8pi3.json";
      const appToken = "aaCaSz115wkOf48f1Rr0YB6mC";
      const response = await fetch(apiUrl, {
        headers: {
          "X-App-Token": appToken, // Incluir el token en los encabezados
        },
      });
      if (!response.ok)
        throw new Error("Error al obtener la TRM más reciente.");
      const data = await response.json();
      if (!data || data.length === 0)
        throw new Error("No se encontraron datos de la TRM.");
      trm = parseFloat(data[0].valor);
    }

    if (isNaN(trm)) throw new Error("La TRM obtenida no es válida.");

    let convertedAmount;
    if (fromCurrency === "COP" && toCurrency === "USD") {
      convertedAmount = amount / trm; // Convertir de COP a USD
    } else if (fromCurrency === "USD" && toCurrency === "COP") {
      convertedAmount = amount * trm; // Convertir de USD a COP
    } else {
      throw new Error("Conversión no soportada.");
    }

    const formattedAmount = convertedAmount.toLocaleString("es", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    const formattedInput = amount.toLocaleString("es", {});
    resultDiv.innerHTML = `${formattedInput} ${fromCurrency} equivale a ${formattedAmount} ${toCurrency} (TRM: ${trm.toLocaleString(
      "es"
    )} COP/USD)`;
  } catch (error) {
    console.error("Error al realizar la conversión:", error);
    resultDiv.innerHTML =
      "Error al obtener la tasa de cambio. Por favor, intente más tarde.";
  }
}