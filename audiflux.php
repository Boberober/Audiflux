<?php
/*
Plugin Name: AudiFlux
Version: 0.1-alpha
Description: PLUGIN DESCRIPTION HERE
Author: Robin Björklund, Joel Besada
*/


if( !class_exists('Audioflux') ) {

  class Audioflux {

    public function __construct() {

      $this->screens = array('post', 'page');

      add_action( 'add_meta_boxes', array( $this, 'audioflux_add_meta_box' ) );
      add_action( 'save_post', array( $this, 'audioflux_save_meta_box_data' ) );

      add_action( 'admin_print_styles', array( $this, 'audioflux_admin_styles' ) );

      add_action( 'wp_ajax_upload_audio', array( $this, 'upload_audio_callback' ) );

      add_shortcode( 'audioflux_player', array( $this, 'audioflux_player_fn' ) );

    }

    public function audioflux_add_meta_box() {

      foreach ( $this->screens as $screen ) {
        // remove_meta_box('audioflux_recorder' );
        add_meta_box(
          'audioflux_recorder',
          __( 'Post recording', 'audioflux_textdomain' ),
          array($this, 'audioflux_meta_box_callback'),
          $screen, 'side', 'core'
        );
      }

    }

    public function audioflux_admin_styles(){
        global $typenow;

        // Add style if current page is an allowed posttype
        if( in_array( $typenow, $this->screens ) ) {
            wp_enqueue_style( 'audioflux_meta_box_styles', plugin_dir_url( __FILE__ ) . '/css/audioflux-meta-box.css' );
            wp_enqueue_script( 'audioflux_recorder', plugin_dir_url( __FILE__ ) . '/javascript/recorder.js', array(), '1.0.0', true );
            wp_enqueue_script( 'audioflux_javascript', plugin_dir_url( __FILE__ ) . '/javascript/main.js', array('audioflux_recorder'), '1.0.0', true );
        }
    }
    

    /**
     * Prints the box content.
     * 
     * @param WP_Post $post The object for the current post/page.
     */

    public function audioflux_meta_box_callback( $post ) {

      // Add an nonce field so we can check for it later.
      wp_nonce_field( 'audioflux_meta_box', 'audioflux_meta_box_nonce' );

      /*
       * Use get_post_meta() to retrieve an existing value
       * from the database and use the value for the form.
       */
      $value = get_post_meta( $post->ID, 'audioflux_file', true );

      // echo '<label for="audioflux_new_field">';
      // _e( 'Description for this field', 'audioflux_textdomain' );
      // echo '</label> ';

      ?>
      <!-- <button id="audioflux-recorder" class="btn btn--record">Start Recording</button> -->
      <button id="audioflux-recorder"><span class="mic icon"></span><span class="pause icon"><span></span></button>  
      <input type="hidden" name="audioflux_file" value="<?php echo $value; ?>">
      <div id="recordinglist">
      
      <?php if(isset($value) && !empty($value)) : ?>
        <audio controls>
          <source src="<?php echo $value; ?>" type="audio/mpeg">
          Your browser does not support this audio format.
        </audio>
        <a class="shortcode block" href="<?php echo $value ?>">Insert shortcode</a>
      </div>
      <?php
      endif;
    }

    /**
     * When the post is saved, saves our custom data.
     *
     * @param int $post_id The ID of the post being saved.
     */
    public function audioflux_save_meta_box_data( $post_id ) {

      /*
       * We need to verify this came from our screen and with proper authorization,
       * because the save_post action can be triggered at other times.
       */

      // Check if our nonce is set.
      if ( ! isset( $_POST['audioflux_meta_box_nonce'] ) ) {
        return;
      }

      // Verify that the nonce is valid.
      if ( ! wp_verify_nonce( $_POST['audioflux_meta_box_nonce'], 'audioflux_meta_box' ) ) {
        return;
      }

      // If this is an autosave, our form has not been submitted, so we don't want to do anything.
      if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
        return;
      }

      // Check the user's permissions.
      if ( isset( $_POST['post_type'] ) && 'page' == $_POST['post_type'] ) {

        if ( ! current_user_can( 'edit_page', $post_id ) ) {
          return;
        }

      } else {

        if ( ! current_user_can( 'edit_post', $post_id ) ) {
          return;
        }
      }

      /* OK, its safe for us to save the data now. */
      
      // Make sure that it is set.
      if ( ! isset( $_POST['audioflux_file'] ) ) {
        return;
      }
      // Sanitize user input.
      $my_data = sanitize_text_field( $_POST['audioflux_file'] );

      // Update the meta field in the database.
      update_post_meta( $post_id, 'audioflux_file', $my_data );
    }

    function audioflux_player_fn( $attributes ) {

      // get optional attributes and assign default values if not present
      extract( shortcode_atts( array(
          'file' => '',
      ), $attributes ) );

      ob_start(); ?>

      <audio controls>
        <source src="<?php echo $file; ?>" type="audio/mpeg">
        Your browser does not support this audio format.
      </audio>
      
    

      <?php 

      $output = ob_get_clean();

      return $output;

    }


    function upload_audio_callback() {
      // global $wpdb; // this is how you get access to the database

      $data = substr($_POST['data'], strpos($_POST['data'], ",") + 1);


      $filename = $_POST['filename'];

      $decodedData = base64_decode($data);

      $filepath = plugin_dir_path( __FILE__ ) . $filename;
      $fp = fopen($filepath, 'wb');
      fwrite($fp, $decodedData);
      fclose($fp);

      echo json_encode(array('name' => plugins_url($filename, __FILE__ )));

      die(); // this is required to return a proper result
    }

    public static function activate() {

    } 
    
    public static function deactivate() {
      
    }



  }
}

if( class_exists('Audioflux') ) {

    // Installation and uninstallation hooks
    register_activation_hook(__FILE__, array('Audioflux', 'activate'));
    register_deactivation_hook(__FILE__, array('Audioflux', 'deactivate'));

    // instantiate the plugin class
    $audioflux = new Audioflux();

}