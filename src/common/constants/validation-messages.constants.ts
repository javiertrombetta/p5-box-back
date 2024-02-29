export const validationMessages = {
	auth: {
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
				inUse: 'El correo electrónico ya está en uso.',
			},
			password: {
				isNotEmpty: 'La contraseña es obligatoria.',
				isString: 'La contraseña debe ser una cadena de texto.',
				minLength: 'La contraseña debe tener al menos 6 caracteres.',
				pattern: 'La contraseña debe incluir una letra mayúscula, una minúscula y un número.',
				reset: 'RESET',
			},
			role: {
				isNotEmpty: 'El campo rol no puede estar vacío.',
				isArray: 'El campo rol debe contener un array de roles.',
				isEnum: 'El campo rol es inválido.',
				badRequest: 'Usuario no encontrado.',
				forbidden: '${user.name} ${user.lastname} no tiene los permisos de: [${validRoles}].',
				updated: 'El rol del usuario ${user.name} ${user.lastname} ha sido actualizado con éxito.',
				connotRemoveSelfRole: 'Un administrador no puede remover su propio rol de administrador.',
			},
			photoUrl: {
				isString: 'La foto de usuario debe ser una cadena de texto.',
			},
			state: {
				isEnum: 'El estado no es válido.',
				isInactive: 'El usuario está inactivo.',
				updated: 'User state updated successfully.',
				isActiveState: 'activo',
				isInactiveSate: 'inactivo',
			},
			points: {
				isNumber: 'Los puntos deben ser un número.',
				isPositive: 'Los puntos deben ser un número positivo.',
			},
		},
		account: {
			success: {
				registered: 'Usuario registrado con éxito.',
				loggedIn: 'Usuario logueado con éxito.',
				logout: 'Sesión cerrada correctamente.',
				deleted: 'El usuario ${user.name} ${user.lastname} (${userId}) fue eliminado con éxito.',
				selfDeleted: 'Tu cuenta fue eliminada con éxito.',
			},
			error: {
				unauthorized: 'No estás autorizado a realizar esta acción. Por favor, ingresá al sistema con credenciales de usuario válidas.',
				userNotFound: 'El usuario no fue encontrado.',
				wrongCredentials: 'Las credenciales de acceso son incorrectas.',
				alreadyLoggedIn: 'Ya se encuentra logueado con un usuario activo. Por favor, cierre la sesión y vuelva a intentarlo.',
				notFound: 'Usuario no encontrado.',
			},
		},
		token: {
			isValid: 'El token es válido',
			notFound: 'No se encontró el token de autenticación.',
			invalidOrExpired: 'El token es inválido o expiró.',
		},
		mongoose: {
			unique: 'El valor para {PATH} ya está en uso y debe ser único.',
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
	mails: {
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
	packages: {
		userArray: {
			packageNotFound: 'Paquete no encontrado o no asignado al repartidor.',
			userNotFound: 'Usuario no encontrado o lista de paquetes no válida.',
			isArray: 'La lista de paquetes tiene que ser un arreglo.',
			isNotEmpty: 'El listado de paquetes del usuario no está vacío.',
			cannotUpdate: 'No se pudo actualizar el paquete de la lista.',
			dailyDeliveryLimit: 'No se pueden asignar más de 10 paquetes a la vez.',
		},
		error: {
			packageNotFound: 'Paquete no encontrado.',
			deliveredNotFound: 'Error al obtener los paquetes entregados.',
		},
		success: {
			updatedPackages: 'Paquetes actualizados correctamente.',
			delivered: 'Paquete entregado y registrado correctamente.',
			cancelled: 'Paquete cancelado exitosamente.',
			deleted: 'Paquete eliminado exitosamente.',
		},
		state: {
			available: 'disponible',
			pending: 'pendiente',
			onTheWay: 'en curso',
			delivered: 'entregado',
			notDelivered: 'sin entregar',
		},
	},
	seed: {
		success: {
			seedCompleted: 'Base de datos reconstruida con datos de Faker.',
		},
	},
	serverError: {
		unexpected: 'Ocurrió un error inesperado.',
		internal: 'Error interno en el servidor.',
		urlNotFound: 'La ruta solicitada no existe.',
	},
	maps: {
		success: {
			statusOk: 'OK',
		},
		error: {
			statusError: 'Error en la API de Google Maps: ',
			locationError: 'Error al recibir la ubicación de Google Maps',
		},
	},
	log: {
		action: {
			user: {
				array: {
					clear: 'UPDATE_user_clear_array',
					loadPackages: 'UPDATE_user_addManyPkgs_array',
					addUserPackage: 'UPDATE_user_addPkg_array',
					changeOrder: 'UPDATE_user_changeOrder_array',
				},
				role: {
					addedBothRoles: 'UPDATE_user_change_roleToBoth',
					addedRepartidorRole: 'UPDATE_user_change_roleToDelivery',
					addedAdministradorRole: 'UPDATE_user_change_roleToAdministrator',
				},
				state: {
					activate: 'UPDATE_user_change_stateToActivate',
					deactivate: 'UPDATE_user_change_stateToDeactivate',
				},
				register: 'CREATE_user',
				deleteUser: 'DELETE_user',
				login: 'INFO_user_login',
				logout: 'INFO_user_logout',
				forgotPassword: 'INFO_user_forgotPassword',
				resetPassword: 'UPDATE_user_change_resetPassword',
			},
			packages: {
				state: {
					toAvailable: 'UDPATE_pkg_change_stateToAvailable',
					delivered: 'UPDATE_pkg_change_statusToDelivered',
				},
				deliveryDate: {
					nextDate: 'UDPATE_pkg_change_nextDate',
				},
				newPackage: 'CREATE_pkg',
				updateOnCancel: 'UDPATE_pkg_change_onCancel',
				assignPkgToUser: 'UPDATE_pkg_assign_toUser',
				updateDataPkg: 'UPDATE_pkg_change_data',
				deleted: 'DELETE_pkg',
			},
		},
		entity: {
			user: 'User',
			package: 'Package',
		},
	},
};
