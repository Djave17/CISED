document.addEventListener('DOMContentLoaded', () => {
    const programForm = document.getElementById('createProgramForm');
    const asignaturasContainer = document.getElementById('asignaturasContainer');
    const facultadSelect = document.getElementById('facultad');
    const nivelSelect = document.getElementById('nivel');
    const addAsignaturaBtn = document.getElementById('addAsignatura');
    const removeAsignaturaBtn = document.getElementById('removeAsignatura');
    const programSelector = document.getElementById('programSelector');
    const programNameInput = document.getElementById('programName');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const menuToggle = document.getElementById('menuToggle');

    // Estado de selección de asignaturas
    const selectedAsignaturas = new Set();
    // Cache de datos académicos para poblar programas localmente (como en logic.js)
    let academicData = window.academicData || null;

    // ===== Sidebar toggle =====
    const toggleSidebar = () => {
        if (!sidebar) return;
        sidebar.classList.toggle('open');
        if (sidebarOverlay) sidebarOverlay.classList.toggle('show');
        document.body.classList.toggle('sidebar-open');
    };
    if (menuToggle) menuToggle.addEventListener('click', toggleSidebar);
    if (sidebarOverlay) sidebarOverlay.addEventListener('click', toggleSidebar);

    // ===== Program selector (existente/nuevo) dinámico por facultad/nivel =====
    if (programSelector && programNameInput) {
        const resetProgramSelector = () => {
            programSelector.innerHTML = '';
            const optDefault = document.createElement('option');
            optDefault.value = '';
            optDefault.textContent = 'Seleccione un programa existente';
            const optNew = document.createElement('option');
            optNew.value = 'new';
            optNew.textContent = '+ Agregar Nuevo Programa';
            programSelector.appendChild(optDefault);
            programSelector.appendChild(optNew);
        };

        const populateProgramSelector = (programs) => {
            resetProgramSelector();
            const optNew = programSelector.querySelector('option[value="new"]');
            programs.forEach((p) => {
                const nombre = typeof p === 'string' ? p : (p.nombrePrograma || p.nombre || '');
                if (!nombre) return;
                const option = document.createElement('option');
                option.value = nombre;
                option.textContent = nombre;
                programSelector.insertBefore(option, optNew);
            });
        };

        // Carga una sola vez la oferta académica
        const ensureAcademicData = async () => {
            if (academicData && Array.isArray(academicData)) return academicData;
            try {
                const res = await fetch('/api/academic-data');
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                academicData = await res.json();
                // Exportar a window para otras páginas (paridad con logic.js)
                window.academicData = academicData;
                return academicData;
            } catch (err) {
                console.error('No se pudo cargar /api/academic-data:', err);
                academicData = [];
                return academicData;
            }
        };

        const listProgramsFromData = (facultadVal, nivelVal) => {
            if (!facultadVal || !nivelVal) return [];
            const fac = (academicData || []).find(f => f.facultad === facultadVal);
            if (!fac) return [];
            // En logic.js se usa p.tipo para filtrar por tipo/nivel
            const list = (fac.programas || []).filter(p => p.tipo === nivelVal).map(p => ({ nombrePrograma: p.nombrePrograma }));
            return list;
        };

        const refreshPrograms = async () => {
            // Siempre volver al modo 'selector'
            if (programNameInput) {
                programNameInput.style.display = 'none';
                programNameInput.required = false;
                programNameInput.value = '';
            }
            if (programSelector) {
                programSelector.style.display = 'block';
                programSelector.value = '';
                programSelector.selectedIndex = 0;
            }
            resetProgramSelector();
            const facVal = facultadSelect ? facultadSelect.value : '';
            const nivVal = nivelSelect ? nivelSelect.value : '';
            if (!facVal || !nivVal) return;
            await ensureAcademicData();
            const list = listProgramsFromData(facVal, nivVal);
            populateProgramSelector(list);
            if ((!list || list.length === 0) && window.UI && UI.info) UI.info('No hay programas creados para esta facultad y nivel.');
        };

        // Eventos de cambio en facultad/nivel para cargar programas existentes
        if (facultadSelect) facultadSelect.addEventListener('change', refreshPrograms);
        if (nivelSelect) nivelSelect.addEventListener('change', refreshPrograms);

        // Cambio y blur del selector/input para manejar opción "nuevo"
        programSelector.addEventListener('change', function () {
            if (this.value === 'new') {
                // Limpiar selector y campo de texto antes de mostrar input
                this.value = '';
                this.selectedIndex = 0; // volver al placeholder
                programNameInput.value = '';
                programNameInput.style.display = 'block';
                programNameInput.required = true;
                programNameInput.focus();
                this.style.display = 'none';
            } else if (this.value !== '') {
                programNameInput.style.display = 'none';
                programNameInput.required = false;
                programNameInput.value = this.value;
            } else {
                programNameInput.value = '';
            }
        });
        programNameInput.addEventListener('blur', function () {
            if (this.value === '') {
                this.style.display = 'none';
                programSelector.style.display = 'block';
                programSelector.value = '';
                this.required = false;
            }
        });

        // Inicializar selector limpio
        resetProgramSelector();
        // Si ya hay selección cargada, intentamos poblar al iniciar
        ensureAcademicData().then(() => refreshPrograms());
    }

    // ===== Asignaturas: añadir, seleccionar (checkbox) y eliminar seleccionadas =====
    const updateRemoveButtonState = () => {
        if (removeAsignaturaBtn) {
            const hasAsignaturas = asignaturasContainer && asignaturasContainer.children.length > 0;
            removeAsignaturaBtn.disabled = !hasAsignaturas || selectedAsignaturas.size === 0;
        }
    };

    const addAsignaturaInput = () => {
        const entryId = Date.now();
        const asignaturaEntry = document.createElement('div');
        asignaturaEntry.classList.add('asignatura-entry');
        asignaturaEntry.dataset.id = String(entryId);
        
        // Get today's date in YYYY-MM-DD format for the default date
        const today = new Date().toISOString().split('T')[0];
        
        asignaturaEntry.innerHTML = `
            <input type="checkbox" class="asignatura-checkbox" id="checkbox_${entryId}" />
            <div class="asignatura-grid">
                <div class="form-group">
                    <label class="form-label" for="asignaturaNombre_${entryId}">Nombre de la Asignatura</label>
                    <input class="form-input asignatura-nombre" type="text" id="asignaturaNombre_${entryId}" 
                           name="nombreAsignatura" required placeholder="Ej: Matemáticas Aplicadas">
                </div>
                <div class="form-group">
                    <label class="form-label" for="docenteAsignado_${entryId}">Docente Asignado</label>
                    <input class="form-input docente-asignado" type="text" id="docenteAsignado_${entryId}" 
                           name="docenteAsignado" required placeholder="Ej: Dr. Juan Pérez">
                </div>
                <div class="form-group">
                    <label class="form-label" for="fechaInicioAsignatura_${entryId}">Fecha Inicio</label>
                    <input type="date" class="form-input fecha-inicio" id="fechaInicioAsignatura_${entryId}" 
                           name="fechaInicioAsignatura" value="${today}" required>
                </div>
                <div class="form-group">
                    <label class="form-label" for="fechaFinAsignatura_${entryId}">Fecha Fin</label>
                    <input type="date" class="form-input fecha-fin" id="fechaFinAsignatura_${entryId}" 
                           name="fechaFinAsignatura" value="${today}" required>
                </div>
            </div>
        `;
        if (asignaturasContainer) {
            asignaturasContainer.appendChild(asignaturaEntry);
            updateRemoveButtonState();
        }
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
    if (addAsignaturaBtn) addAsignaturaBtn.addEventListener('click', addAsignaturaInput);
    if (removeAsignaturaBtn) removeAsignaturaBtn.addEventListener('click', () => {
        selectedAsignaturas.forEach((id) => {
            const entry = asignaturasContainer.querySelector(`[data-id="${id}"]`);
            if (entry) entry.remove();
        });
        selectedAsignaturas.clear();
        updateRemoveButtonState();
    });
    if (asignaturasContainer) {
        asignaturasContainer.addEventListener('change', (e) => {
            const target = e.target;
            if (target && target.classList.contains('asignatura-checkbox')) {
                const entry = target.closest('.asignatura-entry');
                const id = entry && entry.dataset.id;
                if (!id) return;
                if (target.checked) {
                    selectedAsignaturas.add(id);
                    entry.classList.add('selected');
                } else {
                    selectedAsignaturas.delete(id);
                    entry.classList.remove('selected');
                }
                updateRemoveButtonState();
            }
        });
    }

    // Form submission handler
    programForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        // Determinar nombre del programa desde selector o input
        let programName = '';
        if (programSelector && programSelector.value && programSelector.value !== 'new') {
            programName = programSelector.value;
        } else {
            programName = document.getElementById('programName').value;
        }
        const facultad = document.getElementById('facultad').value; // Get faculty value
        const nivel = document.getElementById('nivel') ? document.getElementById('nivel').value : '';
        const programType = nivel; // Unificar: el tipo del programa será el nivel seleccionado
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        const studentCount = document.getElementById('studentCount').value;

        // Collect subjects with all their data including dates
        const asignaturas = [];
        asignaturasContainer.querySelectorAll('.asignatura-entry').forEach(entry => {
            const nombreAsignatura = entry.querySelector('[name="nombreAsignatura"]').value;
            const docenteAsignado = entry.querySelector('[name="docenteAsignado"]').value;
            const fechaInicio = entry.querySelector('[name="fechaInicioAsignatura"]').value;
            const fechaFin = entry.querySelector('[name="fechaFinAsignatura"]').value;
            
            // Validate dates
            if (new Date(fechaInicio) > new Date(fechaFin)) {
                alert('La fecha de inicio no puede ser posterior a la fecha de fin');
                return;
            }
            
            if (nombreAsignatura && docenteAsignado && fechaInicio && fechaFin) {
                asignaturas.push({ 
                    nombreAsignatura, 
                    docenteAsignado, 
                    fechaInicioAsignatura: new Date(fechaInicio).toISOString(),
                    fechaFinAsignatura: new Date(fechaFin).toISOString()
                });
            }
        });
        // Create program object with all data
        const singleProgram = {
            nombrePrograma: programName,
            tipo: programType, // debe coincidir con el enum del backend
            fechaInicio: new Date(startDate).toISOString(),
            fechaFinalizacion: new Date(endDate).toISOString(),
            cantidadEstudiantes: parseInt(studentCount, 10) || 0,
            asignaturas: asignaturas // Ya están formateadas con fechas ISO
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
                if (window.UI && UI.success) UI.success('Programa creado con éxito!');
                programForm.reset();
                if (asignaturasContainer) asignaturasContainer.innerHTML = ''; // Clear dynamic fields
                if (programNameInput) {
                    programNameInput.style.display = 'none';
                    programNameInput.required = false;
                }
                if (programSelector) {
                    programSelector.style.display = 'block';
                    programSelector.value = '';
                }
                selectedAsignaturas.clear();
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
                if (window.UI && UI.error) UI.error('Error al crear el programa: ' + msg);
            }
        } catch (error) {
            console.error('Network error:', error);
            if (window.UI && UI.error) UI.error('Error de conexión al intentar crear el programa.');
        }
    });

    // ===== Navegación por teclado (Escape) =====
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (sidebar && sidebar.classList.contains('open')) toggleSidebar();
        }
    });

    // ===== Resize handling =====
    window.addEventListener('resize', () => {
        if (window.innerWidth >= 1024 && sidebar && sidebar.classList.contains('open')) {
            document.body.classList.remove('sidebar-open');
            if (sidebarOverlay) sidebarOverlay.classList.remove('show');
        }
    });

    // ===== Smooth scrolling para navegación anclada =====
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    populateFacultadDropdown(); // Populate the faculty dropdown when the DOM is ready
    populateLevelDropdown(); // Populate the level dropdown when the DOM is ready
    addAsignaturaInput(); // Add one initial subject/teacher pair on load
    updateRemoveButtonState();
});