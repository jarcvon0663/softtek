document.addEventListener("DOMContentLoaded", () => {
    const check = document.querySelector(".check");
    const nominaInputs = document.getElementById("nomina-inputs");
    const subcontractorInput = document.getElementById("subcontractor-input");
    const checkBox = document.getElementById("checkbox-container");
	const checkBox1 = document.getElementById("checkbox1");
	const checkBox2 = document.getElementById("checkbox2");
	const checkBox3 = document.getElementById("checkbox3");
	const checkBox4 = document.getElementById("checkbox4");

    check.addEventListener('change', function () {
        if (check.checked) {
            nominaInputs.style.display = "none";
            checkBox.hidden = true;
			checkBox1.hidden = true;
			checkBox2.hidden = true;
			checkBox3.hidden = true;
			checkBox4.hidden = true;
            subcontractorInput.style.display = "block";
        } else {
            nominaInputs.style.display = "block";
            checkBox.hidden = false;
			checkBox1.hidden = false;
			checkBox2.hidden = false;
			checkBox3.hidden = false;
			checkBox4.hidden = false;
            subcontractorInput.style.display = "none";
        }
    });
});

