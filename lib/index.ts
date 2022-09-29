import { useState, useMemo } from 'react'

interface UseFormArgs<T> {
  defaultValues: T
  validate?: (arg: { formData: T, setError?: SetErrorFunction<T> }) => ErrorMessage<T>
  onSubmit?: (arg: { formData: T, setError?: SetErrorFunction<T> }) => Promise<ErrorMessage<T> | void>
  validateOnBlur?: boolean
}

type ErrorMessage<T> = {
  [P in keyof T]?: string | null;
}


interface PropRegisterRemap {
	onBlur: string | null
	value: string | null
	onChange: string | null
	name: string | null
}


type SetErrorFunction<T> = (fieldName: keyof T, value: string | null) => void

const useForm = <T>({ defaultValues, validate, onSubmit, validateOnBlur = false}: UseFormArgs<T>) => {
  const [formState, setFormState] = useState(defaultValues)
  const [formError, setFormError] = useState<ErrorMessage<T>>({})
  const [loading, setLoading] = useState<boolean>(false)
  const hasErrors = useMemo(() => Object.keys(formError).some(error => formError[error] === null), [formError]);

  const changeValue = (fieldName: keyof T, value: string) => {
    setFormState({
      ...formState,
      [fieldName]: value
    })
    if(formError?.[fieldName]) {
      setFormError({
        ...formError,
        [fieldName]: null
      })
    }
  }


	const setError: SetErrorFunction<T> = (fieldName, value) => {
		setFormError({
			...formError,
			[fieldName]: value
		})
	}

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setLoading(true)
    if(validateForm()) {
      const errors = onSubmit ? await onSubmit({ formData: formState, setError }) : {}
      setFormError(() => ({ ...errors }))
      validateForm()
    }
    setLoading(false)
  }


  const validateForm = () => {
    const errors = validate ? { ...validate({ formData: formState, setError }) } : {}
    const hasErrors = Object.keys(errors).some(error => errors[error] !== null)
    setFormError(errors)
    return !hasErrors
  }

  const registerField = <K extends keyof T>(name: K, remapProps: PropRegisterRemap) => {


		const fieldProps = {}

		if(remapProps['name'] !== null) {
			fieldProps[remapProps['name'] ?? 'name'] = name
		}

		if(remapProps['value'] !== null) {
			fieldProps[remapProps['value'] ?? 'value'] = formState[name]
		}

		if (remapProps['onChange'] !== null) {
			fieldProps[remapProps['onChange'] ?? 'onChange'] = (val: T[K] | any) => {
				const value = val?.target?.checked ?? val?.target?.value ?? val
				changeValue(name, value)
			}
		}

		if (remapProps['onChange'] !== null) {
			fieldProps[remapProps['onChange'] ?? 'onChange'] = (val: T[K] | any) => {
				const value = val?.target?.checked ?? val?.target?.value ?? val
				changeValue(name, value)
			}
		}

		return fieldProps
	}

  return {
    registerField,
    handleSubmit,
    error: formError,
    hasErrors,
    loading,
		formData: formState,
		setError
  }
}

export default useForm