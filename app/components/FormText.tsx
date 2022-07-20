type Props = {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string | number;
  placeholder?: string;
  disabled?: boolean;
  errors?: string[];
};

function FormText({
  label,
  name,
  type = "text",
  placeholder = "",
  defaultValue = "",
  disabled = false,
  errors = [],
}: Props) {
  return (
    <div className="form-control">
      <label htmlFor={name} className="label">
        {label}
      </label>
      <input
        id={name}
        type={type}
        name={name}
        defaultValue={defaultValue}
        disabled={disabled}
        className={`input-bordered input ${
          errors?.length ? "input-error" : ""
        }`}
        placeholder={placeholder}
      />
      {errors && (
        <label
          className="label-text-alt label text-error"
          htmlFor={`${name}-error`}
        >
          {errors[0]}
        </label>
      )}
    </div>
  );
}

export default FormText;
