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

         m = OSCMessage("/test/pa")

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

         #print "send random OSC message", m

         bundle = OSCBundle()
         bundle.setTimeTag(time.time() + 5)
         bundle2 = OSCBundle()
         bundle2.setTimeTag(time.time() + 15)
         bundle2.append({'addr':"/hallo", 'args':["testtesttest"]})
         bundle.append(m)

         bundle.append({'addr':"/print", 'args':["bundled messages:", 2]})
         bundle.append(bundle2)
         bundle.setAddress("/*print")
         bundle.append(("no,", 3, "actually."))

         print bundle

         self.sendMessage(bundle.getBinary(), isBinary = True)
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


