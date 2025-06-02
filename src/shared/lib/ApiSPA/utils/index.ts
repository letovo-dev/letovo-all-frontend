interface ISuccessResponseProps {
  data?: {
    data?: {
      meta: any;
      data?: any;
    };
    status: any;
    statusText: any;
    headers?: any;
  };
  noNestedData?: boolean;
}

export const SuccessResponse = ({ data, noNestedData }: ISuccessResponseProps) => {
  const authorizationHeader = data?.headers?.authorization;
  return {
    success: true,
    data: noNestedData ? data?.data : (data?.data?.data ?? data?.data),
    code: data?.status,
    codeMessage: codeTranslator(data?.status),
    meta: data?.data?.meta,
    statusText: data?.statusText ?? null,
    authorization: authorizationHeader,
  };
};

interface IErrorResponseProps {
  error?: any;
}

export const ErrorResponse = ({ error }: IErrorResponseProps) => {
  const errResponse = {
    success: false,
    data: undefined,
    codeMessage: codeTranslator(error?.status ?? error?.code),
    message: error?.message,
    code: error?.status,
  };
  return errResponse;
};

export const codeTranslator = (code: number | string) => {
  let message;

  switch (code) {
    case 200:
      message = 'Успешно';
      break;
    case 400:
      message = 'Некорректный запрос';
      break;
    case 401:
      message = 'Неверный логин или пароль';
      break;
    case 403:
      message = 'Доступ запрещен';
      break;
    case 404:
      message = 'Страница не найдена';
      break;
    case 406:
      message = 'Пользователь не найден';
      break;
    case 409:
      message = 'Недостаточно денег';
      break;
    case 500:
      message = 'Ошибка сервера';
      break;
    case 'ERR_NETWORK':
      message = 'Ошибка сети';
      break;
    default:
      message = 'Упс, что-то пошло не так :с';
      break;
  }

  return message;
};

export const applyLibConfig = (libConfig: any, requestConfig: any) => {
  const createUrlWithMethod = (method: any) =>
    requestConfig.url.includes('?')
      ? `${requestConfig.url}&_method=${method}`
      : `${requestConfig.url}?_method=${method}`;

  if (libConfig.replacePatchToPost && requestConfig.method === 'PATCH') {
    requestConfig = {
      ...requestConfig,
      url: createUrlWithMethod('PATCH'),
      method: 'POST',
    };
  } else if (libConfig.replacePutToPost && requestConfig.method === 'PUT') {
    requestConfig = {
      ...requestConfig,
      url: createUrlWithMethod('PUT'),
      method: 'POST',
    };
  }

  return requestConfig;
};

/*
TODO: для описания
2xx: Success (успешно):
200 OK («хорошо»);
201 Created («создано»);
202 Accepted («принято»);
203 Non-Authoritative Information («информация не авторитетна»);
204 No Content («нет содержимого»)[2][3];
205 Reset Content («сбросить содержимое»)[2][3];
206 Partial Content («частичное содержимое»)[2][3];
207 Multi-Status («многостатусный»)[5];
208 Already Reported («уже сообщалось»)[6];
226 IM Used («использовано IM»).
3xx: Redirection (перенаправление):
300 Multiple Choices («множество выборов»)[2][7];
301 Moved Permanently («перемещено навсегда»)[2][7];
302 Moved Temporarily («перемещено временно»)[2][7], 302 Found («найдено»)[7];;
303 See Other («смотреть другое»)[2][7];
304 Not Modified («не изменялось»)[2][7];
305 Use Proxy («использовать прокси»)[2][7];
306 — зарезервировано (код использовался только в ранних спецификациях)[7];
307 Temporary Redirect («временное перенаправление»)[7];
308 Permanent Redirect («постоянное перенаправление»)[8].
4xx: Client Error (ошибка клиента):
400 Bad Request («403»)[2][3][4];
401 Unauthorized («не авторизован (не представился)»)[2][3];
402 Payment Required («необходима оплата»)[2][3];
403 Forbidden («запрещено (не уполномочен)»)[2][3];
404 Not Found («не найдено»)[2][3];
405 Method Not Allowed («метод не поддерживается»)[2][3];
406 Not Acceptable («неприемлемо»)[2][3];
407 Proxy Authentication Required («необходима аутентификация прокси»)[2][3];
408 Request Timeout («истекло время ожидания»)[2][3];
409 Conflict («конфликт»)[2][3][4];
410 Gone («удалён»)[2][3];
411 Length Required («необходима длина»)
412 Precondition Failed («условие ложно»)
413 Payload Too Large («полезная нагрузка слишком велика»)
414 URI Too Long («URI слишком длинный»)
415 Unsupported Media Type («неподдерживаемый тип данных»)
416 Range Not Satisfiable («диапазон не достижим»)
417 Expectation Failed («ожидание не удалось»)
418 I’m a teapot («я — чайник»);
419 Authentication Timeout (not in RFC 2616) («обычно ошибка проверки CSRF»);
421 Misdirected Request
422 Unprocessable Entity («необрабатываемый экземпляр»);
423 Locked («заблокировано»);
424 Failed Dependency («невыполненная зависимость»);
425 Too Early («слишком рано»);
426 Upgrade Required («необходимо обновление»);
428 Precondition Required («необходимо предусловие»)
429 Too Many Requests («слишком много запросов»)
431 Request Header Fields Too Large («поля заголовка запроса слишком большие»)
449 Retry With («повторить с»)[1];
451 Unavailable For Legal Reasons («недоступно по юридическим причинам»)
499 Client Closed Request (клиент закрыл соединение);
5xx: Server Error (ошибка сервера):
500 Internal Server Error («внутренняя ошибка сервера»)
501 Not Implemented («не реализовано»)
502 Bad Gateway («плохой, ошибочный шлюз»)
503 Service Unavailable («сервис недоступен»)
504 Gateway Timeout («шлюз не отвечает»)
505 HTTP Version Not Supported («версия HTTP не поддерживается»)
506 Variant Also Negotiates («вариант тоже проводит согласование»)
507 Insufficient Storage («переполнение хранилища»);
508 Loop Detected («обнаружено бесконечное перенаправление»)
509 Bandwidth Limit Exceeded («исчерпана пропускная ширина канала»);
510 Not Extended («не расширено»);
511 Network Authentication Required («требуется сетевая аутентификация»)
520 Unknown Error («неизвестная ошибка»)
521 Web Server Is Down («веб-сервер не работает»)
522 Connection Timed Out («соединение не отвечает»)
523 Origin Is Unreachable («источник недоступен»)
524 A Timeout Occurred («время ожидания истекло»)
525 SSL Handshake Failed («квитирование SSL не удалось»)
526 Invalid SSL Certificate («недействительный сертификат SSL»)
 */
