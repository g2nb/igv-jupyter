from ipykernel.comm import Comm


class IGVComm:

    def __init__(self, id):

        # Use comm to send a message from the kernel
        self.comm = Comm(target_name=id, data={})


    def send(self, message):
        self.comm.send(message)

