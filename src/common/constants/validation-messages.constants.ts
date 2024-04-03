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
				cannotUpdatePhoto: 'Los usuarios de OAuth no pueden actualizar su foto de perfil por este medio.',
				fileNotValid: 'No se proporcionó un archivo de imagen o no es válido.',
				fileNotFound: 'No se encontró un archivo de foto existente.',
				uploadSuccess: 'La foto fue actualizada con éxito.',
				uploadFail: 'La foto no pudo se pudo cargar correctamente por el siguiente error: {{error}}',
			},
			state: {
				isEnum: 'El campo estado no es válido.',
				isInactive: 'Tu cuenta está deshabilitada.',
				isInactiveByScore: 'Tu cuenta está deshabilitada por baja puntuación.',
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
				setPoints: 'Puntos establecidos a ${points} para el usuario ${userId}.',
			},
			blockUntil: {
				loginInfo: 'Debido a tu declaración jurada recientemente registrada, no podés iniciar sesión hasta el',
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
				googleAccountNotFound: 'La cuenta de Google no fue encontrada.',
				wrongCredentials: 'Las credenciales de acceso son incorrectas.',
				alreadyLoggedIn: 'Estás intentando reingresar pero ya estás logueado con una cuenta. Por favor, cerrá la sesión y volvé a intentarlo.',
				notFound: 'El usuario no fue encontrado.',
				inactiveAccount: 'Tu cuenta está inactiva y no podés ingresar al sistema. Comunicate con un administrador para recibir más detalles. ¡Muchas gracias!',
			},
		},
		token: {
			isNotEmpty: 'El token no puede puede estar vacío.',
			isString: 'El token tiene que ser una cadena de texto.',
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
		passwordChanged: {
			subject: 'Tu contraseña fue recientemente cambiada',
			body: `
				<h1>Cambio de Contraseña</h1>
				<p>Este es un mail de confirmación, para avisarte que la contraseña de tu cuenta fue cambiada por una nueva.</p>
				<p>Si no hiciste este cambio, por favor comunicate cuanto antes con un administrador.</p>
				<p>Saludos,</p>
				<p>Equipo de BoxApp</p>
			`,
		},
		blockedByLegalDeclaration: {
			subject: 'Cuenta Desactivada Temporalmente',
			body: `
				<p>Tu cuenta fue desactivada temporalmente por la siguiente razón: {{reason}}.</p>
				<p>No podés iniciar sesión hasta el {{blockUntil}} hs.</p>
				<p>Abandoná la buena vida y seguí el camino de la luz.</p>
				<p>Saludos,</p>
				<p>Equipo de BoxApp</p>
			`,
		},
		resetCodeEmail: {
			subject: 'Código de Reseteo de Contraseña',
			body: `
				<h1>Código de Reseteo de Contraseña</h1>
				<p>Recibiste este correo porque vos (o alguien más) solicitó restablecer la contraseña de tu cuenta.</p>
				<p>Tu código temporal de reseteo es: <strong>{{resetCode}}</strong></p>
				<p>Este código es válido solo por 5 minutos. Por favor, ingresá este código en la aplicación para continuar con el restablecimiento de tu contraseña.</p>
				<p>Si no solicitaste este cambio, por favor ignorá este correo. En ese caso, tu contraseña permanece sin cambios.</p>
				<p>Saludos,</p>
				<p>Equipo de BoxApp</p>
			`,
		},
	},
	packages: {
		userArray: {
			packageNotFound: 'El paquete no fue encontrado o no está asignado al repartidor.',
			userNotFound: 'El usuario no fue encontrado o la lista de paquetes asociada al usuario no es válida.',
			isArray: 'La lista de paquetes tiene que ser un arreglo.',
			isNotEmpty: 'La lista de paquetes del usuario no está vacía.',
			isUUID: 'La lista tiene que tener paquetes del formato UUID.',
			cannotUpdate: 'No se pudo actualizar el paquete de la lista del usuario.',
			dailyDeliveryLimit: 'No se pueden asignar más de 10 paquetes a la vez.',
			packagesNotFound: 'No se encontraron los siguientes paquetes: ${packages}',
			packageNotAssigned: 'El paquete no está asignado al repartidor y no puede ser cancelado.',
			packageAlreadyAssigned: 'El paquete ${packageId} ya está asignado a la lista de paquetes del usuario.',
			updateSummary: '${addedPackagesCount} paquete(s) cargado(s) exitosamente. ${skippedPackagesCount} paquete(s) ya estaba(n) cargado(s) y se ha(n) omitido.',
		},
		error: {
			packageNotAvailable: 'El paquete no fue encontrado o no está disponible.',
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
			isNotEmpty: 'El campo estado de entrega del paquete no puede estar vacío.',
			available: 'disponible',
			pending: 'pendiente',
			onTheWay: 'en curso',
			delivered: 'entregado',
			dto: 'El estado proporcionado no es válido. Los estados válidos son: pendiente, disponible, en curso, entregado.',
		},
		deliveryFullname: {
			isNotEmpty: 'Se requiere un nombre de destinatario.',
			isString: 'El nombre de destinatario tiene que se una cadena de texto.',
		},
		deliveryAddress: {
			isNotEmpty: 'Se requiere una dirección de entrega.',
			isString: 'La dirección de entrega tiene que se una cadena de texto.',
		},
		deliveryWeight: {
			isNotEmpty: 'Se requiere un peso de paquete de entrega.',
			isNumber: 'El peso ingresado tiene queser un número.',
			isMin: 'El peso tiene que ser positivo.',
		},
		deliveryMan: {
			isNotEmpty: 'Se requiere un repartidor asignado.',
			isUUID: 'El repartidor asignado tiene que ser del formato UUID.',
		},
		deliveryDate: {
			isDate: 'La fecha proporcionada no es formato Date.',
			isNotEmpty: 'Se requiere una fecha de entrega.',
			dateNotValid: 'La fecha proporcionada no es válida.',
		},
	},
	tasks: {
		completed: 'Las tareas de CRON fueron realizadas correctamente.',
		failed: 'No se pudieron completar las tareas de CRON.',
	},
	seed: {
		process: {
			seedCompleted: 'La base de datos fue poblada correctamente con datos de ejemplo.',
			seedError: 'Error al poblar la base de datos:',
			seedDBConnect: 'Conectando a la base de datos en:',
		},
		deliveryMan: {
			name: 'Repartidor',
			lastname: 'Repartidor',
			email: 'repartidor@box.com',
			password: 'repartidor',
		},
		administrator: {
			name: 'Administrador',
			lastname: 'Administrador',
			email: 'admin@box.com',
			password: 'admin',
		},
		models: {
			user: 'User',
			packages: 'Package',
			log: 'Log',
			legal: 'LegalDeclaration',
			location: 'Location',
		},
		defaults: {
			upperCaseChars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
			lowerCaseChars: 'abcdefghijklmnopqrstuvwxyz',
			digitChars: '0123456789',
		},
		location: {
			latitude: -34.549148146059096,
			longitude: -58.468021206013034,
		},
	},
	aws: {
		bucketName: 'photo',
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
		latitude: {
			isNotEmpty: 'La latitud no puede estar vacía.',
			isNumber: ' La latitud tiene que se un número.',
		},
		longitude: {
			isNotEmpty: 'La longitud no puede estar vacía.',
			isNumber: ' La longitud tiene que se un número.',
		},
		lastLocation: {
			notFound: 'No tenés una ubicación registrada.',
		},
	},
	log: {
		action: {
			user: {
				array: {
					clear: 'UPDATE_user_clear_array',
					updateOnePackage: 'UPDATE_user_reorderToTopOnlyOne_array',
					updateFullArray: 'UPDATE_user_reorderAllAndSendOneToTop_array',
					addUserPackage: 'UPDATE_user_addPkg_array',
					startNewDelivery: 'UPDATE_user_startNewDelivery_array',
				},
				role: {
					addedBothRoles: 'UPDATE_user_change_roleToBoth',
					addedRepartidorRole: 'UPDATE_user_change_roleToDelivery',
					addedAdministradorRole: 'UPDATE_user_change_roleToAdministrator',
				},
				state: {
					activate: 'UPDATE_user_change_stateToActivate',
					deactivate: 'UPDATE_user_change_stateToDeactivate',
					deactivateByPoints: 'UPDATE_user_change_deactivateByPoints',
				},
				points: {
					sumForDelivered: 'UPDATE_user_sum_DeliveredPoints',
					sumForBonus: 'UPDATE_user_sum_BonusPoints',
					substractForCancel: 'UPDATE_user_substract_CancelPoints',
					substractForUndelivered: 'UPDATE_user_substract_UndeliveredPoints',
					substractForLegalDeclare: 'UPDATE_user_substract_LegalDeclarePoints',
					resetDeliveriesCount: 'UPDATE_user_reset_DeliveriesCountPoints',
					setPoints: 'UPDATE_user_set_points',
				},
				register: 'CREATE_local_user',
				oauth: 'CREATE_oauth_user',
				deleteUser: 'DELETE_user',
				login: 'INFO_user_login',
				logout: 'INFO_user_logout',
				forgotPassword: 'INFO_user_forgotPassword',
				resetPassword: 'UPDATE_user_change_resetPassword',
			},
			cron: 'Tarea de CRON ejecutada.',
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
			isNotEmpty: 'El campo acción no puede estar vacío.',
			isString: 'El campo acción debe ser una cadena de caracteres.',
		},
		entity: {
			user: 'User',
			package: 'Package',
			cron: 'SYSTEM',
			isNotEmpty: 'El campo entidad no puede estar vacío.',
			isString: 'El campo entidad debe ser una cadena de caracteres.',
		},
		entityId: {
			isNotEmpty: 'El campo ID de entidad no puede estar vacío.',
			isString: 'El campo ID de entidad debe ser una cadena de caracteres.',
		},
		timestamp: {
			isNotEmpty: 'La fecha y hora de la acción no puede estar vacía.',
			isDate: 'La fecha y hora proporcionadas deben ser un valor de fecha válido.',
		},
		changes: {
			isNotEmpty: 'El campo cambios no puede estar vacío.',
			isObject: 'El campo cambios debe ser un objeto.',
		},
		performedBy: {
			isNotEmpty: ' El usuario quien registra el log no puede estar vacío.',
			isString: 'El usuario quien registra el log tiene que ser una cadena de texto.',
		},
	},
	reports: {
		packagesNotFound: 'No se encontraron paquetes entregados para la fecha especificada.',
		userNotFound: 'Repartidor no encontrado o el ID es incorrecto',
		userNotSpecified: 'Es necesario especificar un ID de repartidor',
		noPackagesTaken: ' El repartidor no hizo entregas en la fecha seleccionda.',
	},
	swagger: {
		user: {
			name: 'Nombre del usuario',
			lastname: 'Apellido del usuario',
			email: 'Correo electrónico del usuario',
			password: 'Contraseña del usuario',
			newPassword: 'Nueva contraseña del usuario',
			photoUrl: 'URL de la foto del usuario',
			token: 'Token recibido por mail',
			packages: 'Lista de paquetes del usuario para comenzar el día de reparto',
			roles: 'Roles del usuario',
		},
		legals: {
			hasConsumedAlcohol: 'Declaración Jurada de consumo de alcohol',
			isUsingPsychoactiveDrugs: 'Declaración Jurada de consumo de drogas',
			hasEmotionalDistress: 'Declaración Jurada de estado emocional',
		},
		log: {
			timestamp: 'Fecha de acción realizada',
			action: 'Nombre de acción realizada',
			entity: 'Esquema de destino de BD',
			entityId: 'Registro al cual se aplica la acción',
			changes: 'Cambios realizados',
			performedBy: 'Usuario que realiza la acción',
		},
		locations: {
			latitude: 'Latitud de la ubicación',
			longitude: 'Longitud de la ubicación',
		},
		packages: {
			deliveryFullname: 'Nombre completo del destinatario',
			deliveryAddress: 'Dirección de entrega',
			deliveryWeight: 'Peso del paquete',
			deliveryDate: 'Fecha de entrega del paquete',
			state: 'Estado de entrega del paquete',
			deliveryMan: 'Repartidor asignado',
		},
	},
	legals: {
		hasConsumedAlcohol: {
			isNotEmpty: 'La propiedad hasConsumedAlcohol no puede estar vacía.',
			isBoolean: 'La propiedad hasConsumedAlcohol es boolena (true o false).',
		},
		isUsingPsychoactiveDrugs: {
			isNotEmpty: 'La propiedad isUsingPsychoactiveDrugs no puede estar vacía.',
			isBoolean: 'La propiedad isUsingPsychoactiveDrugs es boolena (true o false).',
		},
		hasEmotionalDistress: {
			isNotEmpty: 'La propiedad hasEmotionalDistress no puede estar vacía.',
			isBoolean: 'La propiedad hasEmotionalDistress es boolena (true o false).',
		},
		positiveInfo: 'Jornada de reparto iniciada con éxito.',
		negativeReason: 'Declaración jurada negativa',
		negativeInfo: 'Se cerró la sesión debido a la declaración jurada registrada.',
		timeBlocked: '12h',
		notFound: 'No se encontró la declaración jurada del usuario.',
	},
	mongoose: {
		packages: 'Package',
		users: 'User',
	},
};
