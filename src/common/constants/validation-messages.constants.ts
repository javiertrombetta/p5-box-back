export const validationMessages = {
	user: {
		name: {
			isNotEmpty: 'El nombre es obligatorio.',
			isString: 'El nombre debe ser una cadena de texto.',
		},
		lastname: {
			isNotEmpty: 'El apellido es obligatorio.',
			isString: 'El apellido debe ser una cadena de texto.',
		},
		email: {
			isNotEmpty: 'El correo electrónico es obligatorio.',
			isEmail: 'El correo electrónico no es válido.',
		},
		password: {
			isNotEmpty: 'La contraseña es obligatoria.',
			isString: 'La contraseña debe ser una cadena de texto.',
			minLength: 'La contraseña debe tener al menos 6 caracteres.',
			pattern: 'La contraseña debe incluir una letra mayúscula, una minúscula y un número.',
		},
		role: {
			isNotEmpty: 'El rol no puede estar vacío.',
			isString: 'El rol debe ser una cadena de texto.',
			isEnum: 'El rol no es válido.',
		},
		packages: {
			isArray: 'Los paquetes deben ser un arreglo.',
		},
		state: {
			isEnum: 'El estado no es válido.',
		},
		points: {
			isNumber: 'Los puntos deben ser un número.',
			isPositive: 'Los puntos deben ser un número positivo.',
		},
		success: {
			userRegistered: 'Usuario registrado con éxito.',
			userLoggedIn: 'Usuario logueado con éxito.',
		},
		error: {
			emailInUse: 'El correo ya está en uso.',
			userNotFound: 'Usuario no encontrado.',
			incorrectCredentials: 'Credenciales incorrectas.',
		},
		mongoose: {
			unique: 'El valor para {PATH} ya está en uso y debe ser único.',
		},
	},
};
