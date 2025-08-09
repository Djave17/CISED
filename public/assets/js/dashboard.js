document.addEventListener('DOMContentLoaded', () => {
    const programForm = document.getElementById('createProgramForm');
    const asignaturasContainer = document.getElementById('asignaturasContainer');
    const facultadSelect = document.getElementById('facultad'); // Get the facultad select element
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
    const populateFacultadDropdown = () => {
        const faculties = [
            { value: "FCJHR", text: "Facultad de Ciencias Jurídicas, Humanidades y Relaciones Internacionales" },
            { value: "FIA", text: "Facultad de Ingeniería y Arquitectura" },
            { value: "FMED", text: "Facultad de Medicina" },
            { value: "DPEC", text: "MEAE - Dirección de posgrado y educación continua" },
            { value: "FMDCC", text: "Facultad de Marketing, Diseño y Ciencias de la comunicación" },
            { value: "FCAE", text: "Facultad de Ciencias Administrativas y Económicas" },
            { value: "FODO", text: "Facultad de Odontología" },
            { value: "UC", text: "UAM College" }
        ];

        // Clear existing options (except the default "Seleccione una facultad")
        facultadSelect.innerHTML = '<option value="">Seleccione una facultad</option>';

        // Add new options
        faculties.forEach(faculty => {
            const option = document.createElement('option');
            option.value = faculty.value;
            option.textContent = faculty.text;
            facultadSelect.appendChild(option);
        });
    };

    // Event listener for adding subjects
    addAsignaturaBtn.addEventListener('click', addAsignaturaInput);

    // Form submission handler
    programForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const programName = document.getElementById('programName').value;
        const programType = document.getElementById('programType').value;
        const facultad = document.getElementById('facultad').value; // Get faculty value
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
        const programData = {
            nombrePrograma: programName,
            tipo: programType,
            fechaInicio: startDate,
            fechaFinalizacion: endDate,
            cantidadEstudiantes: parseInt(studentCount, 10),
            asignaturas: asignaturas,
            facultad: facultad
        };

        console.log('Submitting Program Data:', programData);

        // Placeholder URL - replace with your actual backend endpoint
        const endpointUrl = '/api/programs';

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
                // Attempt to parse JSON error response, but fallback to status text
                let errorData = await response.text(); // Read as text first
                try {
                    errorData = JSON.parse(errorData); // Try to parse as JSON
                } catch (e) {
                    // If parsing fails, keep it as text
                }
                const error = await response.json();
                console.error('Error creating program:', error);
                alert('Error al crear el programa: ' + (error.message || response.statusText));
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
    addAsignaturaInput(); // Add one initial subject/teacher pair on load
});