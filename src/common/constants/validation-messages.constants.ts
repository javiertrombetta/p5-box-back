export const validationMessages = {
	auth: {
		user: {
			name: {
				isNotEmpty: 'El campo nombre es obligatorio.',
				isString: 'El nombre tiene que ser una cadena de texto.',
			},
			lastname: {
				isNotEmpty: 'El campo apellido es obligatorio.',
				isString: 'El apellido tiene que ser una cadena de texto.',
			},
			email: {
				isNotEmpty: 'El campo correo electrónico es obligatorio.',
				isEmail: 'El correo electrónico no es válido.',
				inUse: 'El correo electrónico ya está en uso.',
			},
			password: {
				isNotEmpty: 'El campo contraseña es obligatorio.',
				isString: 'La contraseña tiene que ser una cadena de texto.',
				minLength: 'La contraseña tiene que tener al menos 6 caracteres.',
				pattern: 'La contraseña tiene que incluir una letra mayúscula, una minúscula y un número.',
				reset: 'RESET',
			},
			role: {
				isNotEmpty: 'El campo rol no puede estar vacío.',
				isArray: 'El campo rol debe contener un array de roles.',
				isEnum: 'El campo rol es inválido.',
				badRequest: 'El usuario no fue encontrado.',
				forbidden: '${user.name} ${user.lastname} no tiene los permisos de: [${validRoles}].',
				updated: 'El rol del usuario ${user.name} ${user.lastname} se actualizó con éxito.',
				connotRemoveSelfRole: 'Un usuario no puede quitar su propio rol de administrador.',
			},
			photoUrl: {
				isString: 'La foto de usuario debe ser una cadena de texto.',
			},
			state: {
				isEnum: 'El campo estado no es válido.',
				isInactive: 'El usuario está inactivo.',
				isActiveState: 'activo',
				isInactiveSate: 'inactivo',
				validStates: ['activo', 'inactivo'],
				invalidStateError: 'El estado proporcionado no es válido. Los estados válidos son activo o inactivo.',
				cannotChangeOwnState: 'Un administrador no puede cambiar su propio estado.',
				changeSuccess: 'El estado del usuario fue cambiado correctamente a ${state}.',
			},
			points: {
				isNumber: 'Los puntos deben ser un número.',
				isPositive: 'Los puntos deben ser un número positivo.',
			},
		},
		account: {
			success: {
				registered: 'El usuario se registró con éxito.',
				loggedIn: 'El usuario ingresó con éxito.',
				logout: 'La sesión se cerró con éxito.',
				deleted: 'El usuario ${user.name} ${user.lastname} (${userId}) fue eliminado con éxito.',
				selfDeleted: 'Tu cuenta fue eliminada con éxito.',
			},
			error: {
				unauthorized: 'No estás autorizado a realizar esta acción. Por favor, ingresá al sistema con credenciales de usuario válidas.',
				userNotFound: 'El usuario no fue encontrado.',
				wrongCredentials: 'Las credenciales de acceso son incorrectas.',
				alreadyLoggedIn: 'Estás intentando reingresar pero ya estás logueado con una cuenta. Por favor, cerrá la sesión y volvé a intentarlo.',
				notFound: 'El usuario no fue encontrado.',
				inactiveAccount: 'Tu cuenta está inactiva y no podés ingresar al sistema. Comunicate con un administrador para recibir más detalles. ¡Muchas gracias!',
			},
		},
		token: {
			isValid: 'El token es válido',
			notFound: 'No se encontró el token de autenticación.',
			invalidOrExpired: 'El token es inválido o expiró.',
		},
		mongoose: {
			unique: 'El valor para {PATH} ya está en uso y tiene que ser único.',
		},
		forgotPassword: {
			emailSent: 'Se envió un correo electrónico con instrucciones para restablecer la contraseña.',
			userNotFound: 'No existe una cuenta con ese correo electrónico.',
			error: 'Hubo un error al intentar realizar la operación de restablecimiento de contraseña.',
		},
		resetPassword: {
			success: 'La contraseña fue restablecida con éxito.',
			tokenInvalidOrExpired: 'El token de restablecimiento no es válido o expiró.',
			error: 'Hubo un error al restablecer la contraseña.',
		},
	},
	mails: {
		from: '"Box" <cuenta@dominio.com>',
		resetPasswordEmail: {
			subject: 'Restablecimiento de contraseña',
			body: `
				<h1>Solicitud de restablecimiento de contraseña</h1>
				<p>Para restablecer tu contraseña, por favor ingresá al siguiente enlace:</p>
				<a href="{{resetUrl}}">Restablecer contraseña</a>
			`,
		},
		passwordChanged: {
			subject: 'Tu contraseña fue recientemente cambiada',
			body: `
				<h1>Cambio de Contraseña</h1>
				<p>Este es un correo de confirmación, notificando que la contraseña de tu cuenta fue cambiada por una nueva.</p>
			`,
		},
	},
	packages: {
		userArray: {
			packageNotFound: 'El paquete no fue encontrado o no está asignado al repartidor.',
			userNotFound: 'El usuario no fue encontrado o la lista de paquetes asociada al usuario no es válida.',
			isArray: 'La lista de paquetes tiene que ser un arreglo.',
			isNotEmpty: 'La lista de paquetes del usuario no está vacía.',
			cannotUpdate: 'No se pudo actualizar el paquete de la lista del usuario.',
			dailyDeliveryLimit: 'No se pueden asignar más de 10 paquetes a la vez.',
			packagesNotFound: 'No se encontraron los siguientes paquetes: ${packages}',
			packageNotAssigned: 'El paquete no está asignado al repartidor y no puede ser cancelado.',
		},
		error: {
			packageNotFound: 'El paquete no fue encontrado.',
			deliveredNotFound: 'Hubo un error al obtener los paquetes entregados.',
			createError: 'Hubo un error de servidor al intentar crear el paquete.',
		},
		success: {
			updatedPackages: 'Los paquetes fueron actualizados correctamente.',
			delivered: 'El paquete fue entregado y registrado correctamente.',
			cancelled: 'La entrega del paquete fue cancelada correctamente.',
			deleted: 'Se eliminó el paquete correctamente.',
		},
		state: {
			available: 'disponible',
			pending: 'pendiente',
			onTheWay: 'en curso',
			delivered: 'entregado',
			// notDelivered: 'sin entregar',
		},
		deliveryDate: {
			dateNotValid: 'La fecha proporcionada no es válida.',
		},
	},
	seed: {
		success: {
			seedCompleted: 'La base de datos fue reconstruida con datos aleatorios de Faker.',
		},
	},
	serverError: {
		unexpected: 'Hubo un error inesperado en el servidor.',
		internal: 'Hubo un error interno en el servidor.',
		urlNotFound: 'La ruta solicitada no existe.',
	},
	maps: {
		success: {
			statusOk: 'OK',
		},
		error: {
			statusError: 'Hubo un error en la API de Google Maps: ',
			locationError: 'Hubo un error al recibir la ubicación de Google Maps',
		},
		route: {
			notFound: 'No se pudo obtener la ruta. Verifica que la dirección de entrega del paquete sea correcta.',
			apiError: 'Hubo un error al comunicarse con Google Maps API.',
		},
	},
	locations: {
		lastLocation: {
			notFound: 'No tenés una ubicación registrada.',
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
