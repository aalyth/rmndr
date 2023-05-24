#pragma once

#ifdef __linux__ 

#include "../../internals/ws_common.hpp"
#include "../network/tcp_server.hpp"
#include "../network/linux/linux_tcp_client.hpp"

#define DEFAULT_BACKLOG_SIZE 5

namespace websockets { namespace network {
  class LinuxTcpServer : public TcpServer {
    public:
        LinuxTcpServer(size_t backlog = DEFAULT_BACKLOG_SIZE) : _num_backlog(backlog) {}
        bool listen(const uint16_t port) override;
        bool poll() override;
        TcpClient* accept() override;
        bool available() override;
        void close() override;
        virtual ~LinuxTcpServer();

    protected:
        virtual int getSocket() const override { return _socket; }
    
    private:
        int _socket;
        size_t _num_backlog;
    };
}} // websockets::network

#endif // #ifdef __linux__ 
