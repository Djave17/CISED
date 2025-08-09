document.addEventListener('DOMContentLoaded', () => {
    const programForm = document.getElementById('createProgramForm');
    const asignaturasContainer = document.getElementById('asignaturasContainer');
    const addAsignaturaBtn = document.getElementById('addAsignatura');

    // Function to add a new subject and teacher input pair
    const addAsignaturaInput = () => {
        const asignaturaEntry = document.createElement('div');
        asignaturaEntry.classList.add('asignatura-entry');
        // Generate a unique ID for the new entry to help with labeling and potential removal
        const entryId = Date.now(); // Using timestamp as a simple unique ID
        asignaturaEntry.innerHTML = `
            <label for="asignaturaNombre_${entryId}">Nombre de la Asignatura:</label>
            <input type="text" id="asignaturaNombre_${entryId}" class="asignatura-nombre" required>
            <label for="docenteAsignado_${entryId}">Docente Asignado:</label>
            <input type="text" id="docenteAsignado_${entryId}" class="docente-asignado" required>
            <button type="button" class="remove-asignatura">Eliminar Asignatura</button>
        `;
        asignaturasContainer.appendChild(asignaturaEntry);
    };

    // Add initial subject and teacher input fields
    addSubjectInput();
    addTeacherInput();

    // Event listener for adding subjects
    addAsignaturaBtn.addEventListener('click', addAsignaturaInput);

    // Event listener for removing subjects or teachers (using event delegation)
    document.addEventListener('click', (event) => {
        if (event.target.classList.contains('remove-item')) {
            event.target.closest('.form-group').remove();
        }
    });

    // Form submission handler
    programForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const programName = document.getElementById('programName').value;
        const programType = document.getElementById('programType').value;
        const facultad = document.getElementById('facultad').value; // Get faculty value
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        const studentCount = document.getElementById('studentCount').value;

        const asignaturas = [];
        asignaturasContainer.querySelectorAll('.asignatura-entry').forEach(entry => {
            const nombreAsignatura = entry.querySelector('.asignatura-nombre').value;
            const docenteAsignado = entry.querySelector('.docente-asignado').value;
            if (nombreAsignatura && docenteAsignado) {
                asignaturas.push({
                    nombreAsignatura: nombreAsignatura,
                    docenteAsignado: docenteAsignado
                });
            }
        });

        const programData = {
            nombrePrograma: programName,
            tipo: programType,
            fechaInicio: startDate,
            fechaFinalizacion: endDate,
            cantidadEstudiantes: parseInt(studentCount, 10),
            asignaturas: asignaturas,
            facultad: facultad // Include faculty in the data
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
                programForm.reset(); // Reset the form
                asignaturasContainer.innerHTML = ''; // Clear dynamic fields
                addSubjectInput(); // Add initial empty fields
                addTeacherInput();
            } else {
                const error = await response.json();
                console.error('Error creating program:', error);
                alert('Error al crear el programa: ' + (error.message || response.statusText));
            }
        } catch (error) {
            console.error('Network error:', error);
            alert('Error de conexión al intentar crear el programa.');
        }
    });
});