import asyncio
from collections.abc import Mapping
import datetime
import logging
import os
import pickle
import re
import struct
import sys
from multiprocessing import Pipe
from logging import Handler
from logging.handlers import RotatingFileHandler, DatagramHandler, DEFAULT_UDP_LOGGING_PORT
from typing import Any
from threading import Thread
from initconf import ConfData



def logserver(DEFAULT_UDP_LOGGING_PORT=DEFAULT_UDP_LOGGING_PORT):
    try:
        loop = asyncio.new_event_loop()
        listen = loop.create_datagram_endpoint(lambda: LogServer(), ('127.0.0.80', DEFAULT_UDP_LOGGING_PORT), reuse_port=True)
        transport, protocol = loop.run_until_complete(listen)
        loop.run_forever()
        transport.close()
        loop.run_until_complete(transport.wait_closed())
        loop.close()
    except Exception as e:
        print(e.with_traceback())

def logsetup(DEFAULT_UDP_LOGGING_PORT=DEFAULT_UDP_LOGGING_PORT):
    try:
        reciever = None
        if ConfData.logging.enable is True:
            size = ConfData.logging.maxsize
            if size[-1] == 'B': x = 1
            elif size[-1] == 'K': x = 1024
            elif size[-1] == 'M': x = 1024*1024
            elif size[-1] == 'G': x = 1024*1024*1024
            size = int(size[:-1]) * x
            path = os.path.abspath(ConfData.logging.path)
            minimum = ConfData.logging.level
            rotation = ConfData.logging.rotation
            timedelta = ConfData.general.timedelta
            if minimum.lower() not in ['debug','info','warning','error','critical']:
                raise Exception
            
            socketHandler = DatagramHandler('127.0.0.80', DEFAULT_UDP_LOGGING_PORT)
            logging.root.addHandler(socketHandler)
            logging.root.setLevel(minimum)
            logging.getLogger('asyncio').setLevel(logging.WARNING)

            mainlog = logging.getLogger('mainlog')
            mainlog.propagate = False
            logform = LogFormatter(timedelta, "%(asctime)s %(levelname)s %(processName)s - %(threadName)s:: %(message)s")

            if ConfData.logging.keeping in ["file", "both"]:
                if ConfData.logging.separate is True:
                    seperate = {
                        '/debug_pyns.log':   logging.DEBUG,
                        '/info_pyns.log':    logging.INFO,
                        '/warning_pyns.log': logging.WARNING,
                        '/error_pyns.log':   logging.ERROR,
                        '/critical_pyns.log':logging.CRITICAL 
                    }
                    handlers = []
                    for lvl in seperate:
                        statement = RotatingFileHandler(filename=path+lvl, maxBytes=size, backupCount=rotation, delay=True)
                        statement.setFormatter(logform)
                        statement.addFilter(LogFilter(seperate[lvl]))
                        handlers.append(statement)
                    mainlog.handlers = handlers

                else:
                    statement = RotatingFileHandler(filename=path+'/pyns.log', maxBytes=size, backupCount=rotation)
                    statement.setFormatter(logform)
                    
                    mainlog.addHandler(statement)

            if ConfData.logging.keeping in ["db", "both"]:
                reciever, sender = Pipe()
                dbhandler = PipeHandler(sender, minimum)
                dbhandler.setFormatter(logform)
                mainlog.addHandler(dbhandler)

            Thread(target=logserver, args=(DEFAULT_UDP_LOGGING_PORT,),daemon=True).start()
        else:
            logging.disable()

        return reciever
    except Exception as e:
        print(e.with_traceback())
        logging.critical('Bad loging setup', exc_info=(logging.DEBUG >= logging.root.level))
        sys.exit(1)
    

class PipeHandler(Handler):

    def __init__(self, sender, level) -> None:
        self.logsender = sender
        super().__init__(level)

    def emit(self, record):
        try:
            self.formatter.format(record)
            self.logsender.send(record)
        except Exception as e:
            print(e.with_traceback())
  
class LogFilter(object):
    def __init__(self, level):
        self.__level = level

    def filter(self, logRecord):
        return logRecord.levelno == self.__level


class LogFormatter(logging.Formatter):
    ANSI_RE = re.compile(r"\x1b\[[0-9;]*m")

    def __init__(self, timedelta, fmt: str | None = None, datefmt: str | None = None, style = "%", validate: bool = True, *, defaults: Mapping[str, Any] | None = None) -> None:
        self.timedelta = timedelta
        super().__init__(fmt, datefmt, style, validate, defaults=defaults)

    def converter(self, timestamp):
        offset = datetime.timedelta(hours=self.timedelta)
        tz = datetime.timezone(offset)
        return datetime.datetime.fromtimestamp(timestamp, tz=tz)

    def formatTime(self, record, datefmt=None):
        dt = self.converter(record.created)
        if datefmt:
            return dt.strftime(datefmt)
        else:
            return dt.isoformat(timespec='milliseconds')

    def formatMessage(self, record):
        record.message = re.sub(self.ANSI_RE, "", record.message)
        return self._style.format(record)

class LogServer(asyncio.DatagramProtocol):

     def __init__(self) -> None:
          super().__init__()    


     def connection_made(self, transport:asyncio.Transport):
          self.transport = transport

     def datagram_received(self, data: bytes, addr: tuple[str | Any, int]) -> None:
          try:
               if len(data) < 4: return
               slen = struct.unpack('>L', data[:4])[0] 
               chunk = data[4:][:slen]
               if len(chunk) != slen:
                    print(len(chunk), slen) 
                    return
               try: 
                    obj = pickle.loads(chunk)
                    record = logging.makeLogRecord(obj)
                    logger = logging.getLogger('mainlog')
                    logger.handle(record)
               except Exception as e: 
                    print(e.with_traceback())          
          except Exception as e:
               print(e.with_traceback())  