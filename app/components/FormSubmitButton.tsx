import { RefreshIcon } from "@heroicons/react/outline";

type Props = {
  isSubmitting: boolean;
};

export default function FormSubmitButton({ isSubmitting }: Props) {
  return (
    <button
      type="submit"
      className="btn btn-primary mt-5"
      cy-data="formSubmitButton"
      disabled={isSubmitting}
    >
      {isSubmitting ? (
        <>
          <RefreshIcon className="mr-2 h-5 w-5 animate-spin" />
          Submitting...
        </>
      ) : (
        "Submit"
      )}
    </button>
  );
}
