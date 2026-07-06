import { useState } from 'react';

type PasswordFieldProps = {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

// Injected via front-component style bridge (same path as Twenty Linaria styles).
// Inline style objects do not reliably apply position:absolute in remote DOM.
const PASSWORD_FIELD_STYLES = `
.baitk-password-field {
  box-sizing: border-box;
  display: inline-flex;
  flex-direction: column;
  position: relative;
  width: 100%;
}

.baitk-password-field__label {
  color: var(--t-font-color-secondary);
  font-size: var(--t-font-size-xs);
  font-weight: var(--t-font-weight-medium);
  margin-bottom: var(--t-spacing-1);
}

.baitk-password-field__label-spacer {
  font-size: var(--t-font-size-xs);
  font-weight: var(--t-font-weight-medium);
  margin-bottom: var(--t-spacing-1);
  user-select: none;
  visibility: hidden;
}

.baitk-password-field__input-container {
  align-items: center;
  background-color: inherit;
  display: flex;
  flex-direction: row;
  position: relative;
  width: 100%;
}

.baitk-password-field__input {
  background-color: var(--t-background-transparent-lighter);
  border: 1px solid var(--t-border-color-medium);
  border-radius: var(--t-border-radius-sm);
  box-sizing: border-box;
  color: var(--t-font-color-primary);
  display: flex;
  flex-grow: 1;
  font-family: var(--t-font-family);
  font-size: var(--t-font-size-md);
  font-weight: var(--t-font-weight-regular);
  height: 32px;
  max-width: none;
  outline: none;
  padding: var(--t-spacing-2);
  text-overflow: ellipsis;
  width: 100%;
}

.baitk-password-field__input::placeholder {
  color: var(--t-font-color-light);
  font-family: var(--t-font-family);
  font-weight: var(--t-font-weight-medium);
}

.baitk-password-field__input:focus {
  border-color: var(--t-color-blue);
}

.baitk-password-field__trailing {
  align-items: center;
  bottom: 0;
  display: flex;
  justify-content: center;
  margin: auto 0;
  padding-right: var(--t-spacing-2);
  position: absolute;
  right: 0;
  top: 0;
}

.baitk-password-field__toggle {
  align-items: center;
  color: var(--t-font-color-light);
  cursor: pointer;
  display: flex;
  height: 16px;
  justify-content: center;
  width: 16px;
}

.baitk-password-field__input-container:focus-within
  .baitk-password-field__toggle {
  color: var(--t-font-color-secondary);
}

.baitk-password-field__toggle svg {
  display: block;
  height: 16px;
  width: 16px;
}
`;

const EyeIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M10 12a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" />
    <path d="M21 12c-2.4 4 -5.4 6 -9 6c-3.6 0 -6.6 -2 -9 -6c2.4 -4 5.4 -6 9 -6c3.6 0 6.6 2 9 6" />
  </svg>
);

const EyeOffIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M10.585 10.587a2 2 0 0 0 2.829 2.828" />
    <path d="M16.681 16.673a8.717 8.717 0 0 1 -4.681 1.327c-3.6 0 -6.6 -2 -9 -6c1.272 -2.12 2.712 -3.678 4.32 -4.674m2.86 -1.146a9.055 9.055 0 0 1 1.82 -.18c3.6 0 6.6 2 9 6c-.666 1.11 -1.379 2.067 -2.138 2.87" />
    <path d="M3 3l18 18" />
  </svg>
);

export const PasswordField = ({
  label,
  value,
  onChange,
  placeholder,
}: PasswordFieldProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const resolvedPlaceholder = label ? undefined : (placeholder ?? 'Password');

  return (
    <>
      <style>{PASSWORD_FIELD_STYLES}</style>

      <div className="baitk-password-field" data-baitk-password-field="v2">
        {label ? (
          <label className="baitk-password-field__label">{label}</label>
        ) : (
          <span className="baitk-password-field__label-spacer" aria-hidden>
            Password
          </span>
        )}

        <div className="baitk-password-field__input-container">
          <input
            className="baitk-password-field__input"
            type={isVisible ? 'text' : 'password'}
            placeholder={resolvedPlaceholder}
            value={value}
            autoComplete="off"
            tabIndex={0}
            onChange={(event) => onChange(event.target.value)}
          />

          <div className="baitk-password-field__trailing">
            <div
              className="baitk-password-field__toggle"
              role="button"
              tabIndex={0}
              aria-label={isVisible ? 'Hide password' : 'Show password'}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => setIsVisible((visible) => !visible)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  setIsVisible((visible) => !visible);
                }
              }}
            >
              {isVisible ? <EyeOffIcon /> : <EyeIcon />}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
