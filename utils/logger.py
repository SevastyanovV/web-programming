import logging
from os import getenv
from sys import stderr, stdout
from typing import TextIO

_INFO_FORMAT: str = '%(asctime)s.%(msecs)3d %(levelname)s in %(name)s: %(message)s'
_ERROR_FORMAT: str = '%(asctime)s.%(msecs)3d %(levelname)s in %(name)s: %(message)s'
_LOGGING_LEVEL: int = (
    logging.DEBUG if getenv('LOGGING_LEVEL') == 'DEBUG' else logging.INFO)


def get_info_logger(name: str) -> logging.Logger:
    """
    Функция для получения объекта логирования, предназначенного для вывода
    сообщений уровня DEBUG (если переменная окружения LOGGING_LEVEL имеет
    значение DEBUG) и INFO.

    Args:
        name: имя объекта логирования

    Returns:
        Объект класса Logger из logging
    """
    return _get_logger(name, stdout, _LOGGING_LEVEL, _INFO_FORMAT)


def get_error_logger(name: str) -> logging.Logger:
    """
    Функция для получения объекта логирования, предназначенного для вывода
    сообщений уровней WARNING, ERROR и CRITICAL.

    Args:
        name: имя объекта логирования

    Returns:
        Объект класса Logger из logging
    """
    return _get_logger(name, stderr, logging.ERROR, _ERROR_FORMAT)


def _get_logger(
        name: str,
        stream: TextIO,
        log_level: int,
        log_format: str,
) -> logging.Logger:
    """
    Функция для получения объекта логирования, настроенного под нужды проекта.

    Args:
        name: имя объекта логирования
        stream: поток вывода
        log_level: уровень логирования
        log_format: формат лога

    Returns:
        Объект класса Logger из logging
    """
    logger = logging.getLogger(name)
    logger.setLevel(log_level)

    handler = logging.StreamHandler(stream)
    handler.setFormatter(
        logging.Formatter(log_format, '%Y-%m-%d %H:%M:%S'),
    )
    logger.addHandler(handler)

    return logger
