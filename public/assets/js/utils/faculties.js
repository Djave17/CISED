/**
 * Mapeo de facultades con sus siglas
 * Basado en la estructura de la universidad
 */
const FACULTIES = {
  'FACULTAD DE CIENCIAS JURÍDICAS, HUMANIDADES Y RELACIONES INTERNACIONALES': { 
    nombre: 'Ciencias Jurídicas, Humanidades y Relaciones Internacionales', 
    sigla: 'FCHJRI' 
  },
  'FACULTAD DE INGENIERÍA Y ARQUITECTURA': { 
    nombre: 'Ingeniería y Arquitectura', 
    sigla: 'FIA' 
  },
  'FACULTAD DE MEDICINA': { 
    nombre: 'Medicina', 
    sigla: 'FM' 
  },
  'FACULTAD DE MARKETING, DISEÑO Y CIENCIAS DE LA COMUNICACIÓN': { 
    nombre: 'Marketing, Diseño y Ciencias de la Comunicación', 
    sigla: 'FMDCC' 
  },
  'FACULTAD DE CIENCIAS ADMINISTRATIVAS Y ECONÓMICAS': { 
    nombre: 'Ciencias Administrativas y Económicas', 
    sigla: 'FCAE' 
  },
  'FACULTAD DE ODONTOLOGÍA': { 
    nombre: 'Odontología', 
    sigla: 'FO' 
  }
};

/**
 * Obtiene la información de una facultad por su nombre
 * @param {string} nombreCompleto - Nombre completo de la facultad
 * @returns {Object} Objeto con nombre y sigla de la facultad
 */
export function getFacultyInfo(nombreCompleto) {
  if (!nombreCompleto) {
    return { nombre: 'Sin especificar', sigla: 'N/A' };
  }
  
  const nombreNormalizado = nombreCompleto.toUpperCase().trim();
  return FACULTIES[nombreNormalizado] || { 
    nombre: nombreCompleto, 
    sigla: nombreCompleto.split(' ').map(p => p[0]).join('').toUpperCase()
  };
}

/**
 * Formatea el nombre de la facultad para mostrar
 * @param {string} nombreCompleto - Nombre completo de la facultad
 * @param {boolean} [mostrarSigla=true] - Mostrar la sigla entre paréntesis
 * @returns {string} Nombre formateado (ej: "Ingeniería y Arquitectura (FIA)")
 */
export function formatFacultyName(nombreCompleto, mostrarSigla = true) {
  const { nombre, sigla } = getFacultyInfo(nombreCompleto);
  return mostrarSigla ? `${nombre} (${sigla})` : nombre;
}

/**
 * Obtiene todas las facultades ordenadas alfabéticamente
 * @returns {Array} Lista de facultades con nombre y sigla
 */
export function getAllFaculties() {
  return Object.values(FACULTIES)
    .sort((a, b) => a.nombre.localeCompare(b.nombre));
}

/**
 * Obtiene las opciones para un select de facultades
 * @returns {string} HTML con las opciones para un select
 */
export function getFacultySelectOptions() {
  const facultades = getAllFaculties();
  return facultades.map(fac => 
    `<option value="${fac.nombre}">${fac.nombre} (${fac.sigla})</option>`
  ).join('');
}
