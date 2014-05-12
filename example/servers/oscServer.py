import time

from autobahn.twisted.websocket import WebSocketServerProtocol, \
                                       WebSocketServerFactory

from OSC import OSCMessage, OSCBundle

from random import randint, uniform

class MyServerProtocol(WebSocketServerProtocol):

   def onConnect(self, request):
      print("Client connecting: {0}".format(request.peer))

   def onOpen(self):

      print("WebSocket connection open.")

      def sendRandomOSCMessage():

         m = OSCMessage("/test")

         for x in range(0, randint(0, 3)) :
            m.append(randint(0, 9999))

         for x in range(0, randint(0, 3)) :
            m.append(uniform(0, 9999))

         for x in range(0, randint(0, 3)) :
            m.append("teststring")

         for x in range(0, randint(0, 3)) :
            m.append(uniform(0, 9999))

         # add blob

         for x in range(0, randint(0, 1)) :
            m.append("somebinarydatabumbum","b")

         print "send random OSC message", m

         self.factory.reactor.callLater(5, sendRandomOSCMessage)

      sendRandomOSCMessage()

   def onMessage(self, payload, isBinary):
      print 'got message', payload, isBinary
      self.sendMessage(payload, isBinary)

   def onClose(self, wasClean, code, reason):
      print("WebSocket connection closed: {0}".format(reason))

if __name__ == '__main__':

   import sys

   from twisted.python import log
   from twisted.internet import reactor

   log.startLogging(sys.stdout)

   factory = WebSocketServerFactory("ws://127.0.0.1:8000", debug = False)
   factory.protocol = MyServerProtocol

   reactor.listenTCP(8000, factory)
   reactor.run()


