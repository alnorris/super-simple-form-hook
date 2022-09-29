import { useState, useMemo  } from 'react'
import useAsyncEffect from './useAsyncEffect'

interface UseFormArgs<T> {
  defaultValues: T
  validate?: ValidateFn<T>
  onSubmit?: onSubmitFn<T>
  validateOnBlur?: boolean
}

export type ValidateFn<T> = (arg: { formData: T, setError?: SetErrorFunction<T> }) => any
export type onSubmitFn<T> = (arg: { formData: T, setError?: SetErrorFunction<T> }) => Promise<any>

type ErrorMessage<T> = {
  [P in keyof T]?: string | null;
}


interface PropRegisterRemap {
	onBlur?: string | null
	value?: string | null
	onChange?: string | null
	name?: string | null
}


type SetErrorFunction<T> = (fieldName: keyof T, value: string | null) => void
type SetFormFunction<T> = (fieldName: keyof T, value: string) => void

const useForm = <T>(args?: UseFormArgs<T>) => {
  const { defaultValues, validate, onSubmit, validateOnBlur = false } = args ?? {}
  const [formState, setFormState] = useState<T>(defaultValues)
  const [formError, setFormError] = useState<ErrorMessage<T>>({})
  const [loading, setLoading] = useState<boolean>(false)
  const [submitted, setSubmitted] = useState<boolean>(false)
  const hasErrors = useMemo(() => Object.keys(formError).some(error => ![undefined, null].includes(formError[error])), [formError]);

  const changeValue = (fieldName: keyof T, value: string) => {
    setFormState(formState => ({
      ...formState,
      [fieldName]: value
    }))
    if(formError?.[fieldName]) {
      setFormError(formError => ({
        ...formError,
        [fieldName]: null
      }))
    }
  }


  const setForm: SetFormFunction<T> = (fieldName, value) => {
		setFormState((formState) => ({
			...formState,
			[fieldName]: value
		}))
  }

	const setError: SetErrorFunction<T> = (fieldName, value) => {
		setFormError((formError) => ({
			...formError,
			[fieldName]: value
		}))
	}

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    validateForm()
    setSubmitted(true)
  }


  const validateForm = () => {
    validate?.({ formData: formState, setError })
  }

  const registerField = <K extends keyof T>(name: K) => {

    return {
      onBlur: () => {
        if (validateOnBlur) validateForm()
      },
      name,
      value: formState?.[name] ?? '',
      onChange: (val: T[K] | any) => {
        changeValue(name, val?.target?.value ?? val)
      }
    }
  }

  useAsyncEffect(async () => {
    try {
      if (submitted && !hasErrors) {
        setLoading(true)
        await onSubmit({ formData: formState, setError })
      }
    } finally {
      setLoading(false)
      setSubmitted(false)
    }
  }, [submitted, formError])


  return {
    registerField,
    handleSubmit,
    loading,
		formValues: formState,
    setFormValue:
		setError,
    formErrors: formError,
    hasErrors,
  }
}

export default useForm