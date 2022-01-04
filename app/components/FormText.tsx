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
  type,
  placeholder,
  defaultValue,
  disabled,
  errors,
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
        className={`input input-bordered ${
          errors?.length ? "input-error" : ""
        }`}
        placeholder={placeholder}
      />
      {errors && (
        <label
          className="label label-text-alt text-error"
          htmlFor={`${name}-error`}
        >
          {errors[0]}
        </label>
      )}
    </div>
  );
}

FormText.defaultProps = {
  type: "text",
  defaultValue: "",
  placeholder: "",
  disabled: false,
  errors: [],
};

export default FormText;
