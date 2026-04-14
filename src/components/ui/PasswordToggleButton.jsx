import { HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';

/**
 * Password visibility toggle button.
 * Uses CSS classes exclusively — no inline onMouseEnter/onMouseLeave hacks —
 * so hover and focus states are stable across re-renders and theme switches.
 */
function PasswordToggleButton({ show, onToggle, 'aria-label': ariaLabel }) {
    const label = ariaLabel ?? (show ? 'Hide password' : 'Show password');

    return (
        <button
            type="button"
            onClick={onToggle}
            aria-label={label}
            className="pwd-toggle-btn"
        >
            {show ? <HiOutlineEyeOff className="w-4 h-4" /> : <HiOutlineEye className="w-4 h-4" />}
        </button>
    );
}

export default PasswordToggleButton;
