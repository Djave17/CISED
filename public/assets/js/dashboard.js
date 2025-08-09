document.addEventListener('DOMContentLoaded', () => {
    const programForm = document.getElementById('createProgramForm');
    const asignaturasContainer = document.getElementById('asignaturasContainer');
    const facultadSelect = document.getElementById('facultad'); // Get the facultad select element
    const nivelSelect = document.getElementById('nivel'); // Get the nivel select element
    const addAsignaturaBtn = document.getElementById('addAsignatura');

    // Function to add a new subject and teacher input pair
    const addAsignaturaInput = () => {
        const asignaturaEntry = document.createElement('div');
        asignaturaEntry.classList.add('asignatura-entry');
        // Generate a unique ID for the new entry to help with labeling, pairing, and removal
        const entryId = Date.now(); // Using timestamp as a simple unique ID
        asignaturaEntry.innerHTML = `
            <label for="asignaturaNombre_${entryId}">Nombre de la Asignatura:</label>
            <input type="text" id="asignaturaNombre_${entryId}" class="asignatura-nombre" required>
            <label for="docenteAsignado_${entryId}">Docente Asignado:</label>
            <input type="text" id="docenteAsignado_${entryId}" class="docente-asignado" required>
            <button type="button" class="remove-asignatura button small">Eliminar Asignatura</button>
        `;
        asignaturasContainer.appendChild(asignaturaEntry);
    };

    // Function to populate the faculty dropdown
    const populateFacultadDropdown = async () => {
        // Reset default option
        facultadSelect.innerHTML = '<option value="">Seleccione una facultad</option>';

        // 1) Lista predefinida (nombres descriptivos)
        const predefined = [
            'Facultad de Ciencias Jurídicas, Humanidades y Relaciones Internacionales',
            'Facultad de Ingeniería y Arquitectura',
            'Facultad de Medicina',
            'MEAE - Dirección de posgrado y educación continua',
            'Facultad de Marketing, Diseño y Ciencias de la comunicación',
            'Facultad de Ciencias Administrativas y Económicas',
            'Facultad de Odontología',
            'UAM College'
        ];

        const seen = new Set();
        const addOption = (label) => {
            if (!label || seen.has(label)) return;
            const option = document.createElement('option');
            option.value = label;
            option.textContent = label;
            facultadSelect.appendChild(option);
            seen.add(label);
        };

        predefined.forEach(addOption);

        // 2) Mezclar con lo que haya en BD
        try {
            const resp = await fetch('/api/academic-data');
            if (resp.ok) {
                const data = await resp.json();
                data.forEach(doc => addOption(doc && doc.facultad));
            }
        } catch (e) {
            console.warn('No se pudo obtener facultades desde BD. Se usa lista predefinida.');
        }

        // (Opcional) ordenar alfabéticamente, manteniendo el placeholder primero
        const options = Array.from(facultadSelect.querySelectorAll('option'))
            .filter(o => o.value !== '');
        options.sort((a, b) => a.textContent.localeCompare(b.textContent, 'es'));
        // Reinsertar ordenadas
        facultadSelect.innerHTML = '<option value="">Seleccione una facultad</option>';
        options.forEach(o => facultadSelect.appendChild(o));
    };

    // Function to populate the level dropdown (valores exactamente como en el enum del backend)
    const populateLevelDropdown = () => {
        const niveles = [
            { value: "Maestría", text: "Maestría" },
            { value: "Diplomado", text: "Diplomado" },
            { value: "Curso", text: "Curso" },
            { value: "Especialización", text: "Especialización" }
        ];

        nivelSelect.innerHTML = '<option value="">Seleccione un nivel</option>';
        niveles.forEach(n => {
            const option = document.createElement('option');
            option.value = n.value; // usar exactamente el texto con acento
            option.textContent = n.text;
            nivelSelect.appendChild(option);
        });
    };

    // Event listener for adding subjects
    addAsignaturaBtn.addEventListener('click', addAsignaturaInput);

    // Form submission handler
    programForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const programName = document.getElementById('programName').value;
        const facultad = document.getElementById('facultad').value; // Get faculty value
        const nivel = document.getElementById('nivel') ? document.getElementById('nivel').value : '';
        const programType = nivel; // Unificar: el tipo del programa será el nivel seleccionado
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        const studentCount = document.getElementById('studentCount').value;

        // Collect subjects and teachers in pairs
        const asignaturas = [];
        asignaturasContainer.querySelectorAll('.asignatura-entry').forEach(entry => {
            const nombreAsignatura = entry.querySelector('.asignatura-nombre').value;
            const docenteAsignado = entry.querySelector('.docente-asignado').value;
            if (nombreAsignatura && docenteAsignado) {
                asignaturas.push({ nombreAsignatura, docenteAsignado });
            }
        });
        const singleProgram = {
            nombrePrograma: programName,
            tipo: programType, // coincide con enum (acentos incluidos)
            fechaInicio: startDate,
            fechaFinalizacion: endDate,
            cantidadEstudiantes: parseInt(studentCount, 10),
            asignaturas: asignaturas
        };

        // Enviar exactamente el formato por lote { facultad, programas: [...] }
        const programData = {
            facultad: facultad,
            programas: [singleProgram]
        };

        console.log('Submitting Program Data:', programData);

        // Placeholder URL - replace with your actual backend endpoint
        // Usar el endpoint existente que actualiza AcademicData.programas
        const endpointUrl = '/api/academic-data/programs';

        try {
            const response = await fetch(endpointUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(programData)
            });

            if (response.ok) {
                const result = await response.json();
                console.log('Program created successfully:', result);
                // Optionally, redirect or show a success message
                alert('Programa creado con éxito!');
                programForm.reset();
                asignaturasContainer.innerHTML = ''; // Clear dynamic fields
                addAsignaturaInput(); // Add one initial empty pair
            } else {
                // Lee una sola vez el cuerpo y arma el mensaje de error
                let raw = await response.text();
                let msg = response.statusText;
                try {
                    const parsed = JSON.parse(raw);
                    msg = parsed.message || msg;
                } catch (_) {
                    if (raw) msg = raw;
                }
                console.error('Error creating program:', { status: response.status, body: raw });
                alert('Error al crear el programa: ' + msg);
            }
        } catch (error) {
            console.error('Network error:', error);
            alert('Error de conexión al intentar crear el programa.');
        }
    });

    // Event listener for removing subject/teacher pairs (using event delegation)
    asignaturasContainer.addEventListener('click', (event) => {
        if (event.target.classList.contains('remove-asignatura')) {
            event.target.closest('.asignatura-entry').remove();
        }
    });

    populateFacultadDropdown(); // Populate the faculty dropdown when the DOM is ready
    populateLevelDropdown(); // Populate the level dropdown when the DOM is ready
    addAsignaturaInput(); // Add one initial subject/teacher pair on load
});