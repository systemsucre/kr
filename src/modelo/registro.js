import pool from "./bdConfig.js";

export class Registro {
  // METODOS

  listar = async () => {
    const sql = `SELECT id, examen as label from examen `;
    const [rows] = await pool.query(sql);
    return rows;
  };

  listarDatosEdicion = async (data) => {
    const sqlConsulta = `SELECT id, consulta, diagnostico, conducta, examen,examenfisico, DATE_FORMAT(fecha, "%Y/%m/%d %H:%m") as fecha, img, if(usuario = ${pool.escape(data.usuario)}, true, false) as edicion
                        from  consulta 
                        where id = ${pool.escape(data.consulta)} and paciente = ${pool.escape(data.paciente)} and delet = false`;
    const [rowsConsulta] = await pool.query(sqlConsulta);
    // console.log(rowsConsulta, data )
    return rowsConsulta;
  };

  listarConsultas = async (id) => { 
    const sql = `SELECT c.id, c.conducta,c.diagnostico, e.entidad, m.medico, DATE_FORMAT(c.fecha, "%Y/%m/%d") as fecha, c.img as imgC, m.img as imgdoctor
                  from consulta c
                  inner join medico m ON m.id = c.usuario
                  inner join paciente p on p.id = c.paciente
                  inner join entidad e ON e.id = m.entidad
                  where p.id = ${pool.escape(id)} and c.delet = false order by c.id desc
    `;
    const [rows] = await pool.query(sql);
    const sqlPaciente = `SELECT id, nhc, ap1, ap2,nombre , ocupacion,DATE_FORMAT(fechanac, "%Y/%m/%d") as fecha, municipio, sexo, estadocivil, nacademico, celular, direccion,antec, gsangre, otros, creating, fototipo, antecper
                  from paciente 
                  where id = ${pool.escape(id)} `;
    const [rowsPaciente] = await pool.query(sqlPaciente);

    let ec = '-'
    let sexo = '-'
    let nivela = '-'
    let ft = '-'
    if (rowsPaciente.length > 0) {
      for (let e of rowsPaciente) {
        if (e.estadocivil == 1) ec = 'Soltero(a)'
        if (e.estadocivil == 2) ec = 'Casado(a)'
        if (e.estadocivil == 3) ec = 'Viudo(a)'
        if (e.estadocivil == 4) ec = 'Divorciado(a)'

        if (e.sexo == 1) sexo = 'Masculino'
        if (e.sexo == 2) sexo = 'Femenino'

        if (e.nacademico == 1) nivela = 'Primaria'
        if (e.nacademico == 2) nivela = 'Bachillerato'
        if (e.nacademico == 3) nivela = 'Estudios superiores'

        if (e.fototipo == 1) ft = 'I'
        if (e.fototipo == 2) ft = 'II'
        if (e.fototipo == 3) ft = 'III'
        if (e.fototipo == 4) ft = 'IV'
        if (e.fototipo == 5) ft = 'V'
        if (e.fototipo == 6) ft = 'VI'
      }
      rowsPaciente[0].ec = ec
      rowsPaciente[0].sexo = sexo
      rowsPaciente[0].nivela = nivela
      rowsPaciente[0].fototipo = ft
      // console.log(ft)

      return [rows, rowsPaciente];
    } else return false
  };


  listarTodosLosDatos = async (consulta, paciente, usuario) => {

    const sql = `SELECT e.id, e.evolucion, e.indicaciones, e.diagnostico, DATE_FORMAT(e.fecha, "%Y/%m/%d") as fecha
                  from evolucion e
                  inner join consulta c on c.id = e.consulta
                  where c.id = ${pool.escape(consulta)} and c.delet = false and e.delet = false order by id DESC`;
    const [rows] = await pool.query(sql);
    const sqlConsulta = `SELECT m.medico as personal, s.servicio, et.entidad, c.id, c.consulta, c.examenfisico, c.diagnostico, c.conducta, e.examen, DATE_FORMAT(c.fecha, "%Y/%m/%d %H:%m") as fecha, c.img, if(c.usuario = ${pool.escape(usuario)}, true, false) as edicion
                        from  consulta c 
                        inner join examen e on e.id = c.examen
                        inner join medico m on m.id = c.usuario
                        inner join servicio s on s.id = m.id 
                        inner join entidad et on et.id = s.entidad
                        where c.id = ${pool.escape(consulta)} and c.paciente = ${pool.escape(paciente)} and c.delet = false order by id asc`;
    const [rowsConsulta] = await pool.query(sqlConsulta);

    const sqlPaciente = `SELECT id, nhc, ap1, ap2,nombre ,ocupacion, DATE_FORMAT(fechanac, "%Y-%m-%d") as fecha, municipio, sexo, estadocivil, nacademico, celular, direccion,antec, antecper, fototipo, gsangre, otros, creating
                        from paciente 
                        where id = ${pool.escape(paciente)} `;
    const [rowsPaciente] = await pool.query(sqlPaciente);

    let ec = '-'
    let sexo = '-'
    let nivela = '-'
    let ft = '-'

    if ( rowsPaciente.length > 0) {
      for (let e of rowsPaciente) {
        if (e.estadocivil == 1) ec = 'Soltero(a)'
        if (e.estadocivil == 2) ec = 'Casado(a)'
        if (e.estadocivil == 3) ec = 'Viudo(a)'
        if (e.estadocivil == 4) ec = 'Divorciado(a)'

        if (e.sexo == 1) sexo = 'Masculino'
        if (e.sexo == 2) sexo = 'Femenino'

        if (e.nacademico == 1) nivela = 'Primaria'
        if (e.nacademico == 2) nivela = 'Bachillerato'
        if (e.nacademico == 3) nivela = 'Estudios superiores'

        if (e.fototipo == 1) ft = 'I'
        if (e.fototipo == 2) ft = 'II'
        if (e.fototipo == 3) ft = 'III'
        if (e.fototipo == 4) ft = 'IV'
        if (e.fototipo == 5) ft = 'V'
        if (e.fototipo == 6) ft = 'VI'
      }
      rowsPaciente[0].ec = ec
      rowsPaciente[0].sexo = sexo
      rowsPaciente[0].nivela = nivela
      rowsPaciente[0].fototipo = ft
      return [rows, rowsConsulta, rowsPaciente];

    } else return false


  };


  insertar = async (datos) => {
    const [result] = await pool.query("INSERT INTO consulta SET  ?", datos);
    if (result.insertId > 0)
      return true;
    else return false
  };

  modificar = async (datos) => {
    // console.log("datos: ", datos);

    const sql = `SELECT * from consulta where paciente = ${pool.escape(datos.paciente)} and id = ${pool.escape(datos.id)} and delet = false`;
    const [rows] = await pool.query(sql);
    if (rows.length > 0) {
      const sql = `UPDATE consulta SET
                consulta = ${pool.escape(datos.consulta)},
                examen = ${pool.escape(datos.examen)},
                examenfisico = ${pool.escape(datos.examenfisico)},
                conducta = ${pool.escape(datos.conducta)},
                diagnostico = ${pool.escape(datos.diagnostico)},
                img = ${pool.escape(datos.img)},
                editing = ${pool.escape(datos.fecha)}
                WHERE id = ${pool.escape(datos.id)} and usuario = ${pool.escape(datos.usuario)}`;

      const [row] = await pool.query(sql);
      // console.log("datos: ", row);

      if (row.affectedRows > 0) {
        return true
      } else return false
    } else return false
  };

  eliminar = async (datos) => {
    // console.log("datos: ", datos);
    const sql = `UPDATE consulta SET
                editing = ${pool.escape(datos.fecha)},
                delet = true
                WHERE id = ${pool.escape(datos.id)} and usuario = ${pool.escape(datos.usuario)}`;

    const [row] = await pool.query(sql);
    if (row.affectedRows > 0) {
      const sql = `UPDATE evolucion SET
        editing = ${pool.escape(datos.fecha)},
        delet = true
        WHERE id = ${pool.escape(datos.id)} and usuario = ${pool.escape(datos.usuario)}`;
      await pool.query(sql);
      return true
    } else return false
    // console.log("datos: ", row);
  };



}
