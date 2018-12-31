from ipykernel.comm import Comm


class IGVComm:

    def __init__(self, id):

        # Use comm to send a message from the kernel
        self.comm = Comm(target_name=id, data={})

        # Add a callback for received messages.
        @self.comm.on_msg
        def _recv(msg):
            print(msg['content']['data'])

    def send(self, message):
        self.comm.send(message)

