/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from "react";
import { Form, redirect, useActionData, useLoaderData, useNavigation } from "react-router-dom";
import { registerPlayer } from "./api";
import Lattice from "./Lattice";
import logo from "../assets/brand/ziidi-shariah-logo.png";
import tagline from "../assets/brand/ziidi-tagline.png";
import safaricomMpesa from "../assets/brand/safaricom-mpesa.png";

// How long the exit animation runs before the form appears.
const LEAVE_MS = 650;
// A kiosk player who walks away mid-form: back to the welcome screen.
const FORM_IDLE_MS = 60_000;

// ?message= is set when someone opens /trivia without registering first.
export const loginLoader = ({ request }) => {
  return new URL(request.url).searchParams.get("message");
};

export const loginAction = async ({ request }) => {
  const formData = await request.formData();
  const name = String(formData.get("name") || "").trim();
  const phone = String(formData.get("phone") || "").trim();

  // Same wording as the backend, checked here first to save a round trip.
  if (!name) return { error: "Please insert name", field: "name" };
  if (!phone) return { error: "Please insert phone number", field: "phone" };

  const pathname = new URL(request.url).searchParams.get("redirectTo") || "/trivia";
  try {
    // { player: { id, name }, token }
    const data = await registerPlayer({ name, phone });
    localStorage.setItem("user", JSON.stringify(data));
    return redirect(pathname);
  } catch (err) {
    if (err.status === 0) {
      return { error: "Can't reach the game right now. Check the connection and try again." };
    }
    // e.g. "Please insert correct phone number" or "You have already played".
    return {
      error: err.message,
      field: /phone/i.test(err.message) ? "phone" : /name/i.test(err.message) ? "name" : null,
    };
  }
};

const Welcome = ({ onStart }) => {
  const [leaving, setLeaving] = useState(false);

  const start = () => {
    if (leaving) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      onStart();
      return;
    }
    setLeaving(true);
    setTimeout(onStart, LEAVE_MS);
  };

  return (
    <div className={`welcome ${leaving ? "is-leaving" : ""}`}>
      <Lattice leaving={leaving} />
      <div className="welcome__brand">
        <img className="welcome__logo" src={logo} alt="Ziidi Shari'ah" />
        <img
          className="welcome__tagline"
          src={tagline}
          alt="Money market fund, powered by M-PESA"
        />
      </div>

      <div className="welcome__intro">
        <h1 className="welcome__title">How well do you know Ziidi Shari&apos;ah?</h1>
        <p className="welcome__text">
          Answer 10 quick questions about Shari&apos;ah-compliant investing on M-PESA. Each phone
          number gets one try.
        </p>
        <button type="button" className="btn btn--light btn--large btn--shine" onClick={start}>
          Start the quiz
        </button>
      </div>

      <img className="welcome__footer" src={safaricomMpesa} alt="Safaricom M-PESA" />
    </div>
  );
};

const LoginPage = () => {
  const navigation = useNavigation();
  const loaderMessage = useLoaderData();
  const actionData = useActionData();
  // Straight to the form when redirected here with a message.
  const [started, setStarted] = useState(Boolean(loaderMessage));

  const isSubmitting = navigation.state !== "idle";
  const error = actionData?.error || loaderMessage;

  // Restarted by any typing or tapping in the form.
  const idleTimer = useRef(null);
  const resetIdle = () => {
    clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => setStarted(false), FORM_IDLE_MS);
  };
  useEffect(() => {
    if (!started) return;
    resetIdle();
    return () => clearTimeout(idleTimer.current);
  }, [started]);

  if (!started) {
    return <Welcome onStart={() => setStarted(true)} />;
  }

  return (
    <div className="register" onInput={resetIdle} onPointerDown={resetIdle}>
      <div className="register__card">
        <img className="register__logo" src={logo} alt="Ziidi Shari'ah" />
        <h1 className="register__title">Enter your details</h1>
        <p className="register__text">We use your phone number to make sure everyone plays once.</p>

        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}

        <Form method="post" replace className="register__form" noValidate>
          <label className="field">
            <span className="field__label">Full name</span>
            <input
              className={`field__input ${actionData?.field === "name" ? "is-invalid" : ""}`}
              type="text"
              name="name"
              autoComplete="name"
              placeholder="e.g. Amina Hassan"
              aria-invalid={actionData?.field === "name"}
              autoFocus
            />
          </label>

          <label className="field">
            <span className="field__label">Phone number</span>
            <input
              className={`field__input ${actionData?.field === "phone" ? "is-invalid" : ""}`}
              type="tel"
              name="phone"
              inputMode="tel"
              autoComplete="tel"
              placeholder="07XX XXX XXX"
              aria-invalid={actionData?.field === "phone"}
            />
          </label>

          <button
            type="submit"
            className="btn btn--primary btn--large btn--block"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="spinner" aria-hidden="true" /> Starting your quiz
              </>
            ) : (
              "Start quiz"
            )}
          </button>
        </Form>

        <button type="button" className="btn btn--text" onClick={() => setStarted(false)}>
          Back
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
