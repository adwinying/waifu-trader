import { RefreshIcon } from "@heroicons/react/outline";

type Props = {
  isSubmitting: boolean;
};

export default function FormSubmitButton({ isSubmitting }: Props) {
  return (
    <button
      type="submit"
      className="mt-5 btn btn-primary"
      disabled={isSubmitting}
    >
      {isSubmitting ? (
        <>
          <RefreshIcon className="w-5 h-5 mr-2 animate-spin" />
          Submitting...
        </>
      ) : (
        "Submit"
      )}
    </button>
  );
}
