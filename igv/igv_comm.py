from ipykernel.comm import Comm


class IGVComm:

    def __init__(self, **kwargs):
        print("defining my_comm")

        # Use comm to send a message from the kernel
        self.my_comm = Comm(target_name='my_comm_target', data={'foo': 1})
        #my_comm.send({'foo': 2})

        # Add a callback for received messages.
        @self.my_comm.on_msg
        def _recv(msg):
            print(msg['content']['data'])

    def send_message(self, message):
        self.my_comm.send(message)

    def send_message_2(self, message):
        return ("%%javascript console.log(message)")