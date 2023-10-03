# MinimalServerHealthInfo

Ensure that the user executing the script is allowed to read systemd protocols, i.e by adding the user to group systemd-journal in Ubuntu.
    
    sudo usermod -aG systemd-journal USERNAME
