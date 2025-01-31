import React, { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import "./generar-dieta.scss";
import { Loader, Button } from "semantic-ui-react";
import { useNavigate } from "react-router-dom";
import { HistoryDiet } from "../../api/history-diet";
import { HistoryTraining } from "../../api/history-training";

const historyDietCtrl = new HistoryDiet();
const historyTrainingCtrl = new HistoryTraining();

function Generators() {
  const [resultadoGenerado, setResultadoGenerado] = useState(null);
  const { user } = useAuth(); // Agregamos isAuthenticated para saber si el usuario está autenticado
  const [cargando, setCargando] = useState(false); // Nuevo estado para el indicador de carga
  const [guardandoEnHistorial, setGuardandoEnHistorial] = useState(false);
  const [diet, setDiet] = useState(false);
  const [training, setTraining] = useState(false);
  const navigate = useNavigate();
  const [objetivo, setObjetivo] = useState(null);
  const [mostrarObjetivos, setMostrarObjetivos] = useState(false);
  const [mostrarOpciones, setMostrarOpciones] = useState(false);

  const objetivos = [
    "Perder peso",
    "Ganar masa muscular",
    "Mejorar la postura",
    "Aumentar la flexibilidad",
    "Fortalecer el sistema cardiovascular",
    "Tonificar el cuerpo",
  ];

  const opciones = ["Normal", "Vegetariana", "Vegana"];

  const generarResultado = async (tipo) => {
    try {
      setCargando(true);

      if (tipo === "dieta") {
        setDiet(true);
        setTraining(false);
      } else if (tipo === "entrenamiento") {
        setDiet(false);
        setTraining(true);
      }

      const userData = {
        age: user.age,
        height: user.height,
        weight: user.weight,
        objetivo,
        opciones: tipo === "dieta" ? mostrarOpciones : null,
      };

      const response = await fetch("http://localhost:8000/generator/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tipo, userData }),
      });

      if (!response.ok) throw new Error("Error en la solicitud");

      const data = await response.json();
      console.log("Respuesta del servidor:", data);

      setResultadoGenerado(data[tipo]);
      setMostrarObjetivos(false);
    } catch (error) {
      console.error("Error al generar el resultado:", error);
    } finally {
      setCargando(false);
    }
  };

  const guardarEnHistorial = async (tipo) => {
    console.log(resultadoGenerado);
    try {
      setGuardandoEnHistorial(true);

      if (tipo === "dieta") {
        await historyDietCtrl.add(user.id, resultadoGenerado);
      }
      // Si el resultado generado es un entrenamiento
      else if (tipo === "entrenamiento") {
        await historyTrainingCtrl.add(user.id, resultadoGenerado);
      }

      // Simulación de espera de 1 segundo (puedes ajustar según tu lógica de guardado real)

      console.log("Guardado en el historial exitoso");
    } catch (error) {
      console.error("Error al guardar en el historial:", error);
    } finally {
      setGuardandoEnHistorial(false);
    }
  };
  const handleSubmit = async (tipo) => {
    // Puedes realizar cualquier acción adicional al enviar el formulario aquí
    await guardarEnHistorial(tipo);
  };

  return (
    <div className="contact-container">
      {user ? (
        <>
          <h1>Generador de Dietas y Entrenamientos</h1>
          <p>
            ¡Hola {user.firstname}! ¿Quieres generar una dieta o un
            entrenamiento personalizado? Haz clic en el botón correspondiente
            para obtener tu resultado.
          </p>
          <div className="button-container">
            {!mostrarObjetivos && (
              <Button onClick={() => setMostrarOpciones(true)}>
                Generar Dieta
              </Button>
            )}

            {mostrarOpciones && (
              <Button onClick={() => setMostrarOpciones(false)}>Cerrar</Button>
            )}
            {mostrarOpciones && (
              <div>
                {opciones.map((obj, index) => (
                  <div key={index}>
                    <input
                      type="radio"
                      id={obj}
                      name="opciones"
                      value={obj}
                      onChange={(e) => setObjetivo(e.target.value)}
                    />
                    <label htmlFor={obj}>{obj}</label>
                  </div>
                ))}
                <Button id="boton" onClick={() => generarResultado("dieta")}>
                  Seleccionar
                </Button>
              </div>
            )}
            {!mostrarOpciones && (
              <Button onClick={() => setMostrarObjetivos(true)}>
                Generar Entrenamiento
              </Button>
            )}
            {mostrarObjetivos && (
              <Button onClick={() => setMostrarObjetivos(false)}>Cerrar</Button>
            )}

            {mostrarObjetivos && (
              <div id="estilo">
                {objetivos.map((obj, index) => (
                  <div key={index}>
                    <input
                      type="radio"
                      id={obj}
                      name="objetivo"
                      value={obj}
                      onChange={(e) => setObjetivo(e.target.value)}
                    />
                    <label htmlFor={obj}>{obj}</label>
                  </div>
                ))}
                <Button
                  id="boton"
                  onClick={() => generarResultado("entrenamiento")}
                >
                  Seleccionar
                </Button>
              </div>
            )}
          </div>

          {cargando && <p>Estamos generando la respuesta adecuada a ti...</p>}
          {cargando && (
            <div className="spinner">
              <Loader active inline="centered" />
            </div>
          )}
          {resultadoGenerado && (
            <div className="response">
              {resultadoGenerado.split("**").map((fragment, index) => (
                <p key={index}>{fragment}</p>
              ))}
              {diet ? (
                <Button
                  onClick={() => handleSubmit("dieta")}
                  disabled={training}
                >
                  {guardandoEnHistorial
                    ? "Guardando..."
                    : "Guardar en el historial de dietas"}
                </Button>
              ) : (
                <Button
                  onClick={() => handleSubmit("entrenamiento")}
                  disabled={diet}
                >
                  {guardandoEnHistorial
                    ? "Guardando..."
                    : "Guardar en el historial de entrenamientos"}
                </Button>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="login-register-container">
          <h1>Generador de Dietas y Entrenamientos</h1>
          <label className="login-register">
            Regístrate o inicia sesión para guardar el historial de tus comidas
            y calcular los macros
          </label>
          <div>
            <Button onClick={() => navigate("/register")}>Registrarse</Button>
            <Button onClick={() => navigate("/login")}>Iniciar Sesión</Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Generators;
