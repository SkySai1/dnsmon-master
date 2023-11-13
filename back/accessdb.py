import datetime
import logging
import time
import uuid
import sys
import psycopg2
from sqlalchemy.engine.base import Engine
from sqlalchemy import CHAR, SmallInteger, TypeDecorator, engine, UUID, BigInteger, Boolean, Column, DateTime, Float, ForeignKey, Integer, String, Text, ARRAY, exc, create_engine, delete, insert, select, or_, not_, update
from sqlalchemy.orm import declarative_base, Session, relationship
from flask_sqlalchemy import SQLAlchemy
# --- DB structure

Base = declarative_base()

def checkconnect(engine:engine.base.Engine, conf):
    try:
        engine.connect()
        Base.metadata.create_all(engine)
        return True
    except:
        logging.error("Fail to check database", exc_info=(logging.DEBUG >= logging.root.level))
        return False

def enginer(_CONF):
    try:  
        engine = create_engine(
            f"postgresql+psycopg2://{_CONF['DATABASE']['dbuser']}:{_CONF['DATABASE']['dbpass']}@{_CONF['DATABASE']['dbhost']}:{int(_CONF['DATABASE']['dbport'])}/{_CONF['DATABASE']['dbname']}",
            connect_args={'connect_timeout': 5},
            pool_pre_ping=True
        )
        if checkconnect(engine, _CONF) is True:
            logging.debug(f"Created new database engine {engine.url}")
            return engine
        else: raise Exception()
    except Exception as e:
        logging.critical(f"The database is unreachable", exc_info=(logging.DEBUG >= logging.root.level))
        sys.exit(1)

class GUID(TypeDecorator):
    """Platform-independent GUID type.

    Uses Postgresql's UUID type, otherwise uses
    CHAR(32), storing as stringified hex values.

    """
    impl = CHAR

    def load_dialect_impl(self, dialect):
        if dialect.name == 'postgresql':
            return dialect.type_descriptor(UUID())
        else:
            return dialect.type_descriptor(CHAR(36))

    def process_bind_param(self, value, dialect):
        if value is None:
            return value
        elif dialect.name == 'postgresql':
            return str(value)
        else:
            if not isinstance(value, uuid.UUID):
                return "%.32x" % uuid.UUID(value)
            else:
                # hexstring
                return "%.32x" % value.int

    def process_result_value(self, value, dialect):
        if value is None:
            return value
        else:
            return uuid.UUID(value)
        
class Nodes(Base):
    __tablename__ = "nodes"
    id = Column(Integer, primary_key=True)
    node = Column(String(255), unique=True)

class Domains(Base):  
    __tablename__ = "domains" 
    id = Column(BigInteger, primary_key=True)
    node = Column(String(255), ForeignKey('nodes.node', ondelete='cascade'), nullable=False)
    ts = Column(DateTime(timezone=True), nullable=False)  
    domain = Column(String(255), nullable=False)  
    status = Column(SmallInteger, nullable=False)
    result = Column(Text)
    message = Column(Text)
    auth = Column(String(255), default = None)

class Zones(Base):
    __tablename__ = "zones"
    id = Column(BigInteger, primary_key=True)
    node = Column(String(255), ForeignKey('nodes.node', ondelete='cascade'), nullable=False)
    ts = Column(DateTime(timezone=True), nullable=False)
    zone = Column(String(255), nullable=False)
    status = Column(Integer, nullable=False)
    serial = Column(Integer)
    message = Column(Text)

class FullResolve(Base): 
    __tablename__ = "fullresolve" 
    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    node = Column(String(255), ForeignKey('nodes.node', ondelete='cascade'), nullable=False)
    ts = Column(DateTime(timezone=True), nullable=False)
    zone = Column(String(255), nullable=False)  
    rtime = Column(Float)

class ShortResolve(Base):
    __tablename__ = "shortresolve" 
    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    node = Column(String(255), ForeignKey('nodes.node', ondelete='cascade'), nullable=False)
    ts = Column(DateTime(timezone=True), nullable=False)
    server = Column(String(255), nullable=False)  
    rtime = Column(Float)


class Servers(Base):  
    __tablename__ = "servers" 
    id = Column(BigInteger, primary_key=True)
    node = Column(String(255), ForeignKey('nodes.node', ondelete='cascade'), nullable=False)
    ts = Column(DateTime(timezone=True), nullable=False)  
    server = Column(String(255), nullable=False)  
    status = Column(SmallInteger, nullable=False)
    message = Column(Text)

class GeoBase(Base):
    __tablename__ = "geobase"
    id = Column(BigInteger, primary_key=True)
    ip = Column(String(255), nullable=False, unique = True)
    latitude = Column(Float) # <- First value in coordinates
    longitude = Column(Float) # <- Second value in coordinates
    country = Column(String(255))
    city = Column(String(255))

class GeoState(Base):  
    __tablename__ = "geostate" 
    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    node = Column(String(255), ForeignKey('nodes.node', ondelete='cascade'), nullable=False)
    ip = Column(String(255), ForeignKey('geobase.ip', ondelete='cascade'), nullable=False)
    ts = Column(DateTime(timezone=True), nullable=False)  
    domain = Column(String(255), nullable=False)
    state = Column(SmallInteger, nullable=False)
    result = Column(Text)

class Logs(Base):
    __tablename__ = "logs"
    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    node = Column(String(255), ForeignKey('nodes.node', ondelete='cascade'), nullable=False)
    ts = Column(DateTime(timezone=True), nullable=False)
    level = Column(String(255), nullable = False)
    object = Column(String(255), nullable = False)
    message = Column(Text)  




class AccessDB:

    def __init__(self, engine:engine, _CONF):
        self.engine = engine
        self.conf = _CONF
        self.timedelta = int(_CONF['GENERAL']['timedelta'])
        self.c = Session(engine)
        logging.debug(f"Initialize new database connect '{engine.url}'")
    
    def drop(self):
        logging.error('Database is lost connection')
        self.c.rollback()
    
    def get_geobase(self):
        try:
            with Session(self.engine) as conn:
                result = conn.execute(select(GeoBase)).fetchall()
                return result
        except Exception as e:
            logging.error('Get geobase from database is fail', exc_info=(logging.DEBUG >= logging.root.level))
            return None, False  




    
