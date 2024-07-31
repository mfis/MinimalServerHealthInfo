# MinimalServerHealthInfo

Ensure that the user executing the script is allowed to read systemd protocols, i.e by adding the user to group systemd-journal in Ubuntu.
    
    sudo usermod -aG systemd-journal USERNAME

# Caution

No guarantees are made about the suitability of this code for your own use. It is provided as-is, and you are responsible for any damage it may cause. You should not use this code without understanding it first.
