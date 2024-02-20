export const validationMessages = {
	auth: {
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
			inUse: 'El correo electrónico ya está en uso.',
		},
		password: {
			isNotEmpty: 'La contraseña es obligatoria.',
			isString: 'La contraseña debe ser una cadena de texto.',
			minLength: 'La contraseña debe tener al menos 6 caracteres.',
			pattern: 'La contraseña debe incluir una letra mayúscula, una minúscula y un número.',
		},
		role: {
			isNotEmpty: 'El campo rol no puede estar vacío.',
			isArray: 'El campo rol debe contener un array de roles.',
			isEnum: 'El campo rol es inválido.',
			badRequest: 'Usuario no encontrado.',
			forbidden: '${user.name} ${user.lastname} no tiene los permisos de: [${validRoles}].',
			updated: 'El rol del usuario ${user.name} ${user.lastname} ha sido actualizado con éxito.',
		},
		packages: {
			isArray: 'La lista de paquetes tiene que ser un arreglo.',
		},
		photoUrl: {
			isString: 'La foto de usuario debe ser una cadena de texto.',
		},
		state: {
			isEnum: 'El estado no es válido.',
			isInactive: 'El usuario está inactivo.',
		},
		points: {
			isNumber: 'Los puntos deben ser un número.',
			isPositive: 'Los puntos deben ser un número positivo.',
		},
		account: {
			registered: 'Usuario registrado con éxito.',
			loggedIn: 'Usuario logueado con éxito.',
			logout: 'Sesión cerrada correctamente.',
			unauthorized: 'No estás autorizado a realizar esta acción. Por favor, ingresá al sistema con credenciales de usuario válidas.',
			userNotFound: 'El usuario no fue encontrado.',
			wrongCredentials: 'Las credenciales de acceso son incorrectas.',
			alreadyLoggedIn: 'Ya se encuentra logueado con un usuario activo. Por favor, cierre la sesión y vuelva a intentarlo.',
			notFound: 'Usuario no encontrado.',
			deleted: 'El usuario ${user.name} ${user.lastname} (${userId}) fue eliminado con éxito.',
			selfDeleted: 'Tu cuenta fue eliminada con éxito.',
		},
		token: {
			notFound: 'No se encontró el token de autenticación.',
			invalidOrExpired: 'El token es inválido o expiró.',
		},
		mongoose: {
			unique: 'El valor para {PATH} ya está en uso y debe ser único.',
		},
		error: {
			internal: 'Error interno en el servidor.',
			urlNotFound: 'La ruta solicitada no existe.',
		},
		forgotPassword: {
			emailSent: 'Se ha enviado un correo electrónico con instrucciones para restablecer la contraseña.',
			userNotFound: 'No existe una cuenta con ese correo electrónico.',
			error: 'Ocurrió un error al intentar realizar la operación de restablecimiento de contraseña.',
		},
		resetPassword: {
			success: 'La contraseña ha sido restablecida con éxito.',
			tokenInvalidOrExpired: 'El token de restablecimiento no es válido o ha expirado.',
			error: 'Ocurrió un error al restablecer la contraseña.',
		},
	},
	mail: {
		from: '"Box" <cuenta@dominio.com>',
		resetPasswordEmail: {
			subject: 'Restablecimiento de contraseña',
			body: `
				<h1>Solicitud de restablecimiento de contraseña</h1>
				<p>Para restablecer tu contraseña, por favor sigue el siguiente enlace:</p>
				<a href="{{resetUrl}}">Restablecer contraseña</a>
			`,
		},
		passwordChanged: {
			subject: 'Tu contraseña ha sido cambiada',
			body: `
				<h1>Cambio de Contraseña</h1>
				<p>Este es un correo de confirmación de que la contraseña para tu cuenta ha sido cambiada correctamente.</p>
			`,
		},
	},
	seed: {
		success: {
			seedCompleted: 'Base de datos reconstruida con datos de Faker.',
		},
	},
};
